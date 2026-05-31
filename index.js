const {
    Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Events, REST, Routes, 
    Partials, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const moment = require('moment');
const axios = require('axios');

const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif';
const STAFF_ROLE_ID = '1508714923696455740'; 

const warns = new Map();
const autoResponders = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildBans
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1507007071634329703';

const commands = [
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
    { name: 'say', description: 'Send message as bot', options: [{ name: 'message', type: 3, description: 'Content', required: true }] },
    { name: 'autorespo', description: 'Manage auto-responses', options: [
        { name: 'action', type: 3, description: 'add or remove', required: true, choices: [{name: 'Add', value: 'add'}, {name: 'Remove', value: 'remove'}] },
        { name: 'trigger', type: 3, description: 'Keyword', required: true },
        { name: 'response', type: 3, description: 'Response', required: false }
    ]},
    { name: 'embed', description: 'Create embed', options: [{ name: 'title', type: 3, description: 'Title', required: true }, { name: 'description', type: 3, description: 'Description', required: true }, { name: 'color', type: 3, description: 'Hex color', required: false }] },
    { name: 'clear', description: 'Delete messages', options: [{ name: 'amount', type: 4, description: '1-100', required: true }] },
    { name: 'kick', description: 'Kick member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'ban', description: 'Ban member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'unban', description: 'Unban a user', options: [{ name: 'userid', type: 3, description: 'User ID', required: true }] },
    { name: 'warn', description: 'Warn a user', options: [{ name: 'user', type: 6, description: 'User', required: true }, { name: 'reason', type: 3, description: 'Reason', required: true }] },
    { name: 'unwarn', description: 'Remove warning', options: [{ name: 'user', type: 6, description: 'User', required: true }, { name: 'index', type: 4, description: 'Warn number', required: true }] },
    { name: 'poll', description: 'Create a poll', options: [{ name: 'question', type: 3, description: 'Question', required: true }, { name: 'option1', type: 3, description: 'Option 1', required: true }, { name: 'option2', type: 3, description: 'Option 2', required: true }] },
    { name: 'timeout', description: 'Timeout user', options: [{ name: 'user', type: 6, description: 'User', required: true }, { name: 'minutes', type: 4, description: 'Minutes', required: true }] },
    { name: 'lock', description: 'Lock channel' },
    { name: 'unlock', description: 'Unlock channel' },
    { name: 'userinfo', description: 'User info', options: [{ name: 'user', type: 6, description: 'User', required: false }] },
    { name: 'serverinfo', description: 'Server info' },
    { name: 'avatar', description: 'Get avatar', options: [{ name: 'user', type: 6, description: 'User', required: false }] },
    { name: 'coinflip', description: 'Flip coin' },
    { name: 'dice', description: 'Roll dice' },
    { name: '8ball', description: '8ball', options: [{ name: 'question', type: 3, description: 'Question', required: true }] },
    { name: 'meme', description: 'Random meme' }
];

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`${client.user.tag} ONLINE!`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !autoResponders.has(message.guild.id)) return;
    const trigger = message.content.toLowerCase();
    if (autoResponders.get(message.guild.id).has(trigger)) message.channel.send(autoResponders.get(message.guild.id).get(trigger));
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
    const { guild, member, commandName, options } = interaction;

    try {
        if (interaction.isChatInputCommand()) {
            if (commandName === 'ping') return interaction.reply(`Pong: ${client.ws.ping}ms`);
            if (commandName === 'say') {
                const input = options.getString('message');
                const isMedia = /\.(gif|webp|png|jpg|jpeg|mp4)$/i.test(input) || input.startsWith('http');
                if (isMedia) {
                    await interaction.reply({ content: '✅ Media sent.', ephemeral: true });
                    return interaction.channel.send({ embeds: [new EmbedBuilder().setImage(input).setColor('Random')] });
                }
                await interaction.channel.send({ content: input });
                return interaction.reply({ content: '✅ Mensahe naipadala na.', ephemeral: true });
            }
            if (commandName === 'autorespo') {
                const action = options.getString('action');
                const trigger = options.getString('trigger').toLowerCase();
                if (!autoResponders.has(guild.id)) autoResponders.set(guild.id, new Map());
                if (action === 'add') {
                    autoResponders.get(guild.id).set(trigger, options.getString('response'));
                    interaction.reply(`✅ Added auto-response: ${trigger}`);
                } else {
                    autoResponders.get(guild.id).delete(trigger);
                    interaction.reply(`✅ Removed auto-response: ${trigger}`);
                }
                return;
            }
            // Add other command logic (clear, ban, etc.) here
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'btn_ticket_support') {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId('menu_support_options').setPlaceholder('Make a selection').addOptions([
                        { label: '📋 ROSTER REGISTRATION', value: 'opt_roster' },
                        { label: '❓ GENERAL SUPPORT', value: 'opt_support' }
                    ])
                );
                return interaction.reply({ content: 'Select:', components: [menu], ephemeral: true });
            }
            if (interaction.customId === 'close_ticket') {
                await interaction.reply('🔒 Closing...');
                setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
            }
        }
    } catch (err) { console.error(err); }
});

client.login(TOKEN);
