const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    Partials,
    ChannelType
} = require('discord.js');

const moment = require('moment');
const axios = require('axios');

const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
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
                await interaction.deferReply();
                const embed = new EmbedBuilder().setTitle('S E L F   R O L E').setDescription('<@&1508559284156235878>\n<@&150855905572186127>\n<@&1508559118913503452>\n<@&1508559365974659172>').setColor(0x000000).setImage(BANNER_URL);
                const row = { type: 1, components: [
                    { type: 2, style: 2, label: 'FIVEM', custom_id: 'role_fivem' },
                    { type: 2, style: 2, label: 'ROBLOX', custom_id: 'role_roblox' },
                    { type: 2, style: 2, label: 'VALO', custom_id: 'role_valo' },
                    { type: 2, style: 2, label: '18+', custom_id: 'role_18' }
                ]};
                return interaction.editReply({ embeds: [embed], components: [row] });
            }
            if (commandName === 'ticket-setup') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Missing permissions', ephemeral: true });
                await interaction.deferReply();
                const embed = new EmbedBuilder().setTitle('AZURA ORG TICKET SUPPORT').setDescription('Please select which type of ticket you want to open \n\n ➤ – AZURA ORG SUPPORT\n ➤ – APPLY FOR STAFF \n ➤ – Public Partnership').setColor(0x000000).setImage('https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif');
                const row = { type: 1, components: [
                    { type: 2, style: 2, label: 'Ticket Support', custom_id: 'ticket_support' },
                    { type: 2, style: 2, label: 'Shop', custom_id: 'ticket_shop' },
                    { type: 2, style: 2, label: 'Partnership', custom_id: 'ticket_partner' }
                ]};
                return interaction.editReply({ embeds: [embed], components: [row] });
            }
            if (commandName === 'clear') {
                const amount = options.getInteger('amount');
                if (amount < 1 || amount > 100) return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({ content: `Successfully deleted ${amount} messages.`, ephemeral: true });
            }
            if (commandName === 'say') { 
                await interaction.deferReply({ ephemeral: true });
                await interaction.channel.send(options.getString('message')); 
                return interaction.editReply({ content: 'Sent' }); 
            }
            if (commandName === 'embed') {
                await interaction.deferReply();
                const title = options.getString('title');
                let description = options.getString('description');
                const color = options.getString('color') || '#5865F2';
                const urlRegex = /(https?:\/\/[^\s]+)/gi;
                const match = description.match(urlRegex);
                const embed = new EmbedBuilder().setTitle(title).setColor(color);
                if (match) { embed.setImage(match[0]); description = description.replace(urlRegex, '').trim(); }
                embed.setDescription(description || ' ');
                return interaction.editReply({ embeds: [embed] });
            }
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
                await interaction.deferReply();
                const res = await axios.get('https://meme-api.com/gimme');
                return interaction.editReply({ embeds: [new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url)] });
            }
        }

        if (interaction.isButton()) {
            // TICKET CREATION
            if (interaction.customId.startsWith('ticket_')) {
                await interaction.deferReply({ ephemeral: true });
                const channel = await guild.channels.create({
                    name: `ticket-${member.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
                
                const closeRow = { type: 1, components: [{ type: 2, style: 4, label: 'Close Ticket', custom_id: 'close_ticket' }]};
                await channel.send({ content: `Welcome <@${member.id}>! Staff will assist you shortly.`, components: [closeRow] });
                return interaction.editReply({ content: `✅ Ticket created: ${channel}` });
            }
            
            // CLOSE TICKET
            if (interaction.customId === 'close_ticket') {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'Only staff can close this!', ephemeral: true });
                await interaction.reply('Closing ticket in 5 seconds...');
                setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
            }

            // ROLES
            const roleMap = { 'role_fivem': 'FIVEM', 'role_roblox': 'ROBLOX', 'role_valo': 'VALORANT', 'role_18': '18+' };
            const roleName = roleMap[interaction.customId];
            if (roleName) {
                const role = guild.roles.cache.find(r => r.name === roleName);
                if (!role) return interaction.reply({ content: 'Role not found', ephemeral: true });
                if (member.roles.cache.has(role.id)) { await member.roles.remove(role); return interaction.reply({ content: `Removed ${roleName}`, ephemeral: true }); }
                else { await member.roles.add(role); return interaction.reply({ content: `Added ${roleName}`, ephemeral: true }); }
            }
        }
    } catch (err) { console.error(err); }
});

client.login(TOKEN);
