const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    Partials
} = require('discord.js');

const moment = require('moment');
const axios = require('axios');

const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';

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
    { name: 'say', description: 'Send message as bot', options: [{ name: 'message', type: 3, description: 'Message content', required: true }] },
    { name: 'embed', description: 'Create embed', options: [
        { name: 'title', type: 3, description: 'Embed title', required: true },
        { name: 'description', type: 3, description: 'Embed description', required: true },
        { name: 'color', type: 3, description: 'Hex color', required: false }
    ]},
    { name: 'clear', description: 'Delete messages', options: [{ name: 'amount', type: 4, description: '1-100', required: true }] },
    { name: 'kick', description: 'Kick member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'ban', description: 'Ban member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
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
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
    const { guild, member } = interaction;

    try {
        if (interaction.isChatInputCommand()) {
            const { commandName, options } = interaction;

            if (commandName === 'ping') return interaction.reply(`Pong: ${client.ws.ping}ms`);
            if (commandName === 'uptime') return interaction.reply(`Uptime: ${moment.duration(client.uptime).humanize()}`);
            
            if (commandName === 'setup-roles') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Missing permissions', ephemeral: true });
                
                // I-defer para hindi mag-timeout ang bot
                await interaction.deferReply({ ephemeral: false });

                const embed = new EmbedBuilder()
                    .setTitle('S E L F   R O L E')
                    // PALITAN ANG MGA ID SA BABA NG TAMANG ROLE ID MULA SA SERVER MO
                    .setDescription(
                        '<@&1508559284156235878> \n' +
                        '<@&1508559055721861271> \n' +
                        '<@&1508559118913503452> \n' +
                        '<@&1508559365974659172>
                    )
                    .setColor(0x000000)
                    .setImage(BANNER_URL);
                    
                const row = { type: 1, components: [
                    { type: 2, style: 2, label: 'FIVEM', custom_id: 'role_fivem' },
                    { type: 2, style: 2, label: 'ROBLOX', custom_id: 'role_roblox' },
                    { type: 2, style: 2, label: 'VALO', custom_id: 'role_valo' },
                    { type: 2, style: 2, label: '18+', custom_id: 'role_18' }
                ]};
                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            if (commandName === 'say') { await interaction.channel.send(options.getString('message')); return interaction.reply({ content: 'Sent', ephemeral: true }); }
            if (commandName === 'embed') {
                const embed = new EmbedBuilder().setTitle(options.getString('title')).setDescription(options.getString('description')).setColor(options.getString('color') || '#5865F2');
                return interaction.reply({ embeds: [embed] });
            }
            if (commandName === 'clear') { await interaction.channel.bulkDelete(options.getInteger('amount'), true); return interaction.reply({ content: 'Deleted', ephemeral: true }); }
            if (commandName === 'kick') { await options.getMember('user').kick(); return interaction.reply('Kicked'); }
            if (commandName === 'ban') { await options.getMember('user').ban(); return interaction.reply('Banned'); }
            if (commandName === 'timeout') { await options.getMember('user').timeout(options.getInteger('minutes') * 60000); return interaction.reply('Timed out'); }
            if (commandName === 'lock') { await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }); return interaction.reply('Locked'); }
            if (commandName === 'unlock') { await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true }); return interaction.reply('Unlocked'); }
            if (commandName === 'userinfo') { const user = options.getUser('user') || interaction.user; return interaction.reply({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor('#5865F2')] }); }
            if (commandName === 'serverinfo') return interaction.reply(`Server: ${guild.name}`);
            if (commandName === 'avatar') return interaction.reply(interaction.user.displayAvatarURL());
            if (commandName === 'coinflip') return interaction.reply(Math.random() > 0.5 ? 'Heads' : 'Tails');
            if (commandName === 'dice') return interaction.reply(`${Math.floor(Math.random() * 6) + 1}`);
            if (commandName === '8ball') return interaction.reply('Yes');
            if (commandName === 'meme') {
                const res = await axios.get('https://meme-api.com/gimme');
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url)] });
            }
        }

        if (interaction.isButton()) {
            const roleMap = { 'role_fivem': 'FIVEM', 'role_roblox': 'ROBLOX', 'role_valo': 'VALORANT', 'role_18': '18+' };
            const roleName = roleMap[interaction.customId];
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (!role) return interaction.reply({ content: 'Role not found', ephemeral: true });
            
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                return interaction.reply({ content: `Removed ${roleName}`, ephemeral: true });
            } else {
                await member.roles.add(role);
                return interaction.reply({ content: `Added ${roleName}`, ephemeral: true });
            }
        }
    } catch (err) { console.error(err); }
});

client.login(TOKEN);
