const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    Partials,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const moment = require('moment');
const axios = require('axios');

const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif';

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
    { name: 'clear', description: 'Delete messages', options: [{ name: 'amount', type: 4, description: '1-100', required: true }] },
    { name: 'kick', description: 'Kick member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'ban', description: 'Ban member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] }
];

client.once('ready', async () => {
    console.log(`${client.user.tag} ONLINE`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    } catch (err) { console.error(err); }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
    const { guild, member } = interaction;

    try {
        if (interaction.isChatInputCommand()) {
            const { commandName, options } = interaction;

            if (commandName === 'ping') return interaction.reply(`Pong: ${client.ws.ping}ms`);
            
            if (commandName === 'setup-roles') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Missing permissions', ephemeral: true });
                await interaction.deferReply();
                const embed = new EmbedBuilder().setTitle('S E L F   R O L E').setDescription('Click the buttons below to get your roles!').setColor(0x000000).setImage(BANNER_URL);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('FIVEM').setCustomId('role_fivem'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('ROBLOX').setCustomId('role_roblox'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('VALO').setCustomId('role_valo'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('18+').setCustomId('role_18')
                );
                return interaction.editReply({ embeds: [embed], components: [row] });
            }
        }

        if (interaction.isButton()) {
            const { customId, member, guild } = interaction;

            // DITO ILAGAY ANG MGA ROLE ID
            const ROLE_MAP = {
                'role_fivem': '1508559284156235878',
                'role_roblox': '1508559055721861271',
                'role_valo': '1508559118913503452',
                'role_18': '1508559365974659172'
            };

            if (ROLE_MAP[customId]) {
                const roleId = ROLE_MAP[customId];
                const role = guild.roles.cache.get(roleId);
                if (!role) return interaction.reply({ content: 'Role not found!', ephemeral: true });

                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(role);
                    return interaction.reply({ content: `Removed ${role.name}.`, ephemeral: true });
                } else {
                    await member.roles.add(role);
                    return interaction.reply({ content: `Added ${role.name}.`, ephemeral: true });
                }
            }

            if (interaction.customId === 'close_ticket') {
                await interaction.reply('Closing in 5s...');
                setTimeout(() => interaction.channel.delete(), 5000);
            }
        }
    } catch (err) { console.error(err); }
});

client.login(TOKEN);
