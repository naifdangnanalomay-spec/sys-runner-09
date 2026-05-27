const {
    Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, 
    Events, Partials, ChannelType, ActionRowBuilder, 
    StringSelectMenuBuilder, ButtonBuilder, ButtonStyle
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
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

client.once('ready', () => console.log(`${client.user.tag} IS ONLINE!`));

// --- PREFIX COMMANDS ---
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.content.startsWith('?')) return;
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') return message.reply(`Pong: ${client.ws.ping}ms`);
    if (command === 'uptime') return message.reply(`Uptime: ${moment.duration(client.uptime).humanize()}`);
    
    if (command === 'clear') {
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) return message.reply('Provide number 1-100');
        await message.channel.bulkDelete(amount, true);
        message.reply(`Deleted ${amount} messages.`);
    }

    if (command === 'ban') {
        const target = message.mentions.members.first();
        if (target) { await target.ban(); message.reply('User banned.'); }
    }

    if (command === 'embed') {
        const [title, description, color] = args.join(' ').split('|');
        const embed = new EmbedBuilder().setTitle(title.trim()).setDescription(description.trim()).setColor(color ? color.trim() : '#5865F2');
        message.channel.send({ embeds: [embed] });
    }

    if (command === 'setup-roles') {
        const embed = new EmbedBuilder().setTitle('S E L F   R O L E').setDescription('<@&1508559284156235878>\n<@&150855905572186127>\n<@&1508559118913503452>\n<@&1508559365974659172>').setColor(0x000000).setImage(BANNER_URL);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('FIVEM').setCustomId('role_fivem'),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('ROBLOX').setCustomId('role_roblox'),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('VALO').setCustomId('role_valo'),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('18+').setCustomId('role_18')
        );
        message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === 'ticket-setup') {
        const embed = new EmbedBuilder().setTitle('AZURA ORG TICKET SUPPORT').setDescription('Please select a ticket type').setColor(0x000000).setImage(TICKET_GIF);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Ticket Support').setCustomId('btn_ticket_support'),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Apply Staff').setCustomId('btn_ticket_staff'),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Partnership').setCustomId('btn_ticket_partner')
        );
        message.channel.send({ embeds: [embed], components: [row] });
    }
});

// --- INTERACTIONS (Buttons, Select Menus) ---
client.on(Events.InteractionCreate, async interaction => {
    const { guild, member, customId } = interaction;

    // Handle Roles
    const roleMap = { 'role_fivem': 'FIVEM', 'role_roblox': 'ROBLOX', 'role_valo': 'VALORANT', 'role_18': '18+' };
    if (roleMap[customId]) {
        const role = guild.roles.cache.find(r => r.name === roleMap[customId]);
        if (member.roles.cache.has(role.id)) { await member.roles.remove(role); interaction.reply({ content: `Removed ${roleMap[customId]}`, ephemeral: true }); }
        else { await member.roles.add(role); interaction.reply({ content: `Added ${roleMap[customId]}`, ephemeral: true }); }
        return;
    }

    // Handle Buttons
    if (interaction.isButton()) {
        if (customId === 'btn_ticket_support') {
            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('menu_support_options').setPlaceholder('Make a selection')
                    .addOptions([{ label: '📋 ROSTER REGISTRATION', value: 'opt_roster' }, { label: '❓ GENERAL SUPPORT', value: 'opt_support' }])
            );
            return interaction.reply({ components: [menu], ephemeral: true });
        }
        if (customId === 'close_ticket') {
            await interaction.reply('Closing...');
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }

    // Handle Select Menu (Roster/Support)
    if (interaction.isStringSelectMenu() && customId === 'menu_support_options') {
        const type = interaction.values[0];
        const channel = await guild.channels.create({
            name: `${type}-${member.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        await channel.send(`Ticket Created for: ${type}`);
        interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
    }
});

client.login(TOKEN);
