const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    Partials,
    ChannelType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const moment = require('moment');
const axios = require('axios');

const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif';
const STAFF_ROLE_ID = '1508714923696455740'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans
    ],
    partials: [
        Partials.Message, Partials.Channel, Partials.Reaction, 
        Partials.User, Partials.GuildMember
    ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1507007071634329703';

const commands = [
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
    { name: 'poll', description: 'Create a poll', options: [{ name: 'question', type: 3, description: 'Poll question', required: true }] },
    { name: 'say', description: 'Send message as bot', options: [{ name: 'message', type: 3, description: 'Message content', required: true }] },
    { name: 'embed', description: 'Create embed', options: [
        { name: 'title', type: 3, description: 'Embed title', required: true },
        { name: 'description', type: 3, description: 'Embed description', required: true },
        { name: 'color', type: 3, description: 'Hex color', required: false }
    ]},
    { name: 'clear', description: 'Delete messages', options: [{ name: 'amount', type: 4, description: '1-100', required: true }] },
    { name: 'kick', description: 'Kick member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'ban', description: 'Ban member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'unban', description: 'Unban a user', options: [{ name: 'userid', type: 3, description: 'User ID to unban', required: true }] },
    { name: 'warn', description: 'Warn a user', options: [
        { name: 'user', type: 6, description: 'User to warn', required: true },
        { name: 'reason', type: 3, description: 'Reason', required: true }
    ]},
    { name: 'timeout', description: 'Timeout user', options: [
        { name: 'user', type: 6, description: 'Target user', required: true },
        { name: 'minutes', type: 4, description: 'Timeout minutes', required: true }
    ]},
    { name: 'lock', description: 'Lock channel' },
    { name: 'unlock', description: 'Unlock channel' },
    { name: 'userinfo', description: 'User information', options: [{ name: 'user', type: 6, description: 'Target user', required: false }] },
    { name: 'serverinfo', description: 'Server information' },
    { name: 'avatar', description: 'Get avatar', options: [{ name: 'user', type: 6, description: 'Target user', required: false }] },
    { name: 'coinflip', description: 'Flip coin' },
    { name: 'dice', description: 'Roll dice' },
    { name: '8ball', description: 'Magic 8ball', options: [{ name: 'question', type: 3, description: 'Your question', required: true }] },
    { name: 'meme', description: 'Random meme' }
];

client.once('ready', async () => {
    console.log(`${client.user.tag} ONLINE`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    } catch (err) { console.error(err); }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
    const { guild, member } = interaction;

    try {
        if (interaction.isChatInputCommand()) {
            const { commandName, options } = interaction;

            if (commandName === 'ping') return interaction.reply(`Pong: ${client.ws.ping}ms`);
            if (commandName === 'uptime') return interaction.reply(`Uptime: ${moment.duration(client.uptime).humanize()}`);
            
            if (commandName === 'poll') {
                const embed = new EmbedBuilder().setTitle('📊 POLL').setDescription(options.getString('question')).setColor('#F1C40F');
                const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
                await msg.react('👍'); await msg.react('👎');
                return;
            }

            if (commandName === 'setup-roles') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Missing permissions', ephemeral: true });
                await interaction.deferReply();
                const embed = new EmbedBuilder().setTitle('S E L F   R O L E').setDescription('<@&1508559284156235878>\n<@&150855905572186127>\n<@&1508559118913503452>\n<@&1508559365974659172>').setColor(0x000000).setImage(BANNER_URL);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('FIVEM').setCustomId('role_fivem'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('ROBLOX').setCustomId('role_roblox'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('VALO').setCustomId('role_valo'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('18+').setCustomId('role_18')
                );
                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            if (commandName === 'ticket-setup') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Missing permissions', ephemeral: true });
                await interaction.deferReply();
                const embed = new EmbedBuilder().setTitle('AZURA ORG TICKET SUPPORT').setDescription('Please select which type of ticket you want to open').setColor(0x000000).setImage(TICKET_GIF);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Ticket Support').setCustomId('btn_ticket_support'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Apply Staff').setCustomId('btn_ticket_staff'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Partnership').setCustomId('btn_ticket_partner')
                );
                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            if (commandName === 'clear') {
                const amount = options.getInteger('amount');
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
            }

            if (commandName === 'unban') {
                if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'No permission', ephemeral: true });
                await guild.bans.remove(options.getString('userid'));
                return interaction.reply('User unbanned.');
            }

            if (commandName === 'warn') {
                if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: 'No permission', ephemeral: true });
                const user = options.getMember('user');
                const reason = options.getString('reason');
                return interaction.reply(`Warned ${user.user.tag} for: ${reason}`);
            }

            // [Lalagay dito ang ibang command logic gaya ng kick, ban, etc.]
            if (commandName === 'kick') { await options.getMember('user').kick(); return interaction.reply('Kicked'); }
            if (commandName === 'ban') { await options.getMember('user').ban(); return interaction.reply('Banned'); }
            
            // ... (Ipagpatuloy ang iba pang command handlers)
        }

        // --- BUTTONS/MENUS ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // [Ilagay ang logic para sa Ticket buttons at Role system dito]
            if (interaction.customId === 'close_ticket') {
                await interaction.reply('Closing in 5s...');
                setTimeout(() => interaction.channel.delete(), 5000);
            }
        }
    } catch (err) { console.error(err); }
});

client.login(TOKEN);
