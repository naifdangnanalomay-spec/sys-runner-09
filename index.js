require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    REST,
    Routes,
    Partials,
    ChannelType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    ActivityType,
    SlashCommandBuilder,
    AuditLogEvent
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 📌 ASSETS & CONFIG
const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif';
const ANIMATED_WELCOME = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif'; 

// 📌 ROLE IDs
const ROLES = {
    FIVEM: '1508559284156235878',       
    ROBLOX: '1508559055721861271',     
    VALORANT: '1508559118913503452',     
    EIGHTEEN_PLUS: '1508559365974659172'  
};

// 📌 CONFIG IDs
const STAFF_ROLE_ID = '1508714923696455740'; 
const VERIFY_ROLE_ID = '1509517115265253487'; 
const OWNER_ID = '1250654354344775703'; 
const CLIENT_ID = '1507007071634329703'; 

// 📌 DATABASES
const warns = new Map();
const autoResponders = new Map();
const reminders = new Map();
const guildSettings = new Map();
const levels = new Map();
const antiNuke = new Map();
const logs = new Map();
const automod = new Map();
const verifyLogs = new Map();
const raidProtection = new Map();
const tokenGrabberProtection = new Map();
const imageGrabberProtection = new Map();
const datingProfiles = new Map(); 

// 📌 BOT SETUP
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildPresences, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildInvites
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.ThreadMember]
});

// 🔑 CREDENTIALS
const TOKEN = process.env.TOKEN; 

// 📌 SLASH COMMANDS — FULL LIST
const commands = [
    new SlashCommandBuilder().setName('setpfp').setDescription('Set bot profile picture').addStringOption(option => option.setName('url').setDescription('Image URL').setRequired(true)),
    new SlashCommandBuilder().setName('setbanner').setDescription('Set bot banner').addStringOption(option => option.setName('url').setDescription('Image URL').setRequired(true)),
    new SlashCommandBuilder().setName('resetbotname').setDescription('Reset bot name to AZURA BOT'),
    new SlashCommandBuilder().setName('setchannellog').setDescription('Set log channel').addChannelOption(option => option.setName('channel').setDescription('Select channel').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('Ban a user').addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason')),
    new SlashCommandBuilder().setName('kick').setDescription('Kick a user').addUserOption(option => option.setName('user').setDescription('User to kick').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason')),
    new SlashCommandBuilder().setName('timeout').setDescription('Timeout a user').addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true)).addIntegerOption(option => option.setName('minutes').setDescription('Minutes').setRequired(true)),
    new SlashCommandBuilder().setName('unban').setDescription('Unban a user').addStringOption(option => option.setName('userid').setDescription('User ID').setRequired(true)),
    new SlashCommandBuilder().setName('purge').setDescription('Delete messages').addIntegerOption(option => option.setName('amount').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Lock current channel'),
    new SlashCommandBuilder().setName('unlock').setDescription('Unlock current channel'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode').addIntegerOption(option => option.setName('seconds').setDescription('Seconds')),
    new SlashCommandBuilder().setName('afk').setDescription('Set AFK mode'),
    new SlashCommandBuilder().setName('avatar').setDescription('Get user avatar').addUserOption(option => option.setName('user').setDescription('User')),
    new SlashCommandBuilder().setName('userinfo').setDescription('Get user info').addUserOption(option => option.setName('user').setDescription('User')),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Get server info'),
    new SlashCommandBuilder().setName('stats').setDescription('Check your level & XP'),
    new SlashCommandBuilder().setName('rank').setDescription('Check your rank'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Server level leaderboard'),
    new SlashCommandBuilder().setName('automod').setDescription('Toggle Automod'),
    new SlashCommandBuilder().setName('antinsfw').setDescription('Toggle Anti-NSFW'),
    new SlashCommandBuilder().setName('antilink').setDescription('Toggle Anti-Link (Links allowed but monitored)'),
    new SlashCommandBuilder().setName('verification').setDescription('Verification system setup').addStringOption(option => option.setName('action').setDescription('setup/disable/status').setRequired(true)),
    new SlashCommandBuilder().setName('welcome').setDescription('Welcome system setup').addStringOption(option => option.setName('action').setDescription('setup/disable/status').setRequired(true)),
    new SlashCommandBuilder().setName('setup').setDescription('Show Anti-Nuke Dashboard & Auto Setup'),
    new SlashCommandBuilder().setName('setup-roles').setDescription('Setup Role Selection Menu'),
    new SlashCommandBuilder().setName('ticket-setup').setDescription('Setup Ticket System'),
    new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
    new SlashCommandBuilder().setName('uptime').setDescription('Check bot uptime'),
    new SlashCommandBuilder().setName('joke').setDescription('Send a random joke'),
    new SlashCommandBuilder().setName('fact').setDescription('Send a random fact'),
    new SlashCommandBuilder().setName('meme').setDescription('Send a random meme'),
    new SlashCommandBuilder().setName('8ball').setDescription('Magic 8ball').addStringOption(option => option.setName('question').setDescription('Your question').setRequired(true)),
    new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
    new SlashCommandBuilder().setName('dice').setDescription('Roll a dice'),
    new SlashCommandBuilder().setName('botinfo').setDescription('Bot information'),
    new SlashCommandBuilder().setName('instagram').setDescription('Instagram link'),
    new SlashCommandBuilder().setName('tiktok').setDescription('TikTok link'),
    new SlashCommandBuilder().setName('youtube').setDescription('YouTube link'),
    
    // ✅ /SAY at /EMBED
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Bot sends any message you want')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('Anything you want to say')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Beautiful message with GIF/Image support')
        .addStringOption(option => option.setName('title').setDescription('Title of embed (optional)').setRequired(false))
        .addStringOption(option => option.setName('description').setDescription('Main text / message').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Color code or name').setRequired(false))
        .addStringOption(option => option.setName('image').setDescription('Image / GIF / Banner URL').setRequired(false))
        .addStringOption(option => option.setName('footer').setDescription('Small text at bottom').setRequired(false)),

    // ✅ SECURITY COMMANDS
    new SlashCommandBuilder().setName('antiraid').setDescription('Toggle Anti-Raid System'),
    new SlashCommandBuilder().setName('antitoken').setDescription('Toggle Anti-Token Grabber Protection'),
    new SlashCommandBuilder().setName('antiimage').setDescription('Toggle Anti-Image Grabber Protection'),

    // ✅ DATING SYSTEM
    new SlashCommandBuilder().setName('dating-setup').setDescription('📝 Create or update your dating profile')
        .addStringOption(o => o.setName('name').setDescription('Your Name').setRequired(true))
        .addIntegerOption(o => o.setName('age').setDescription('Your Age').setRequired(true))
        .addStringOption(o => o.setName('gender').setDescription('Male / Female / Other').setRequired(true))
        .addStringOption(o => o.setName('bio').setDescription('Short description about you').setRequired(true))
        .addStringOption(o => o.setName('image').setDescription('Photo URL / GIF').setRequired(false)),
    new SlashCommandBuilder().setName('dating-profile').setDescription('❤️ View someone\'s profile').addUserOption(o => o.setName('user').setDescription('User to view').setRequired(false)),
    new SlashCommandBuilder().setName('dating-like').setDescription('💖 Like someone\'s profile').addUserOption(o => o.setName('user').setDescription('User you like').setRequired(true)),
    new SlashCommandBuilder().setName('dating-list').setDescription('📋 List all available profiles')
];

// 📌 REGISTER SLASH COMMANDS
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// 📌 BOT READY
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} ONLINE & ALL SYSTEMS LOADED!`);
    setInterval(() => {
        const activities = [{ name: `@OfficialServs | SECURED 💖 DATING ACTIVE`, type: ActivityType.Streaming, url: "https://www.twitch.tv/officialservs" }];
        client.user.setActivity(activities[0].name, { type: activities[0].type, url: activities[0].url });
    }, 1000);
});

// 📌 ANTI-NUKE / SECURITY SYSTEM
client.on(Events.GuildCreate, guild => {
    antiNuke.set(guild.id, {
        enabled: true, logChannel: null, punishment: 'BAN & STRIP ROLES', antiBot: true, antiBan: true, antiKick: true,
        antiMemberUpdate: true, antiGuildUpdate: true, antiChannelCreate: true, antiChannelDelete: true,
        antiChannelUpdate: true, antiRoleCreate: true, antiRoleDelete: true, antiRoleUpdate: true,
        antiWebhook: true, antiLink: false, maxActions: 3, timeWindow: 10000
    });

    raidProtection.set(guild.id, { enabled: true, joinLimit: 5, timeWindow: 10000, joins: [] });
    tokenGrabberProtection.set(guild.id, { enabled: true, blockedDomains: ['discord.gift', 'discordapp.gift', 'steamgift', 'nitro', 'token', 'grabber', 'steal'] });
    imageGrabberProtection.set(guild.id, { enabled: true, blockedDomains: ['imgur.io', 'image-grabber', 'stealimg', 'loger', 'logger'] });
});

// 📌 AUDIT LOG MONITOR
client.on(Events.GuildAuditLogEntryCreate, async (entry, guild) => {
    const settings = antiNuke.get(guild.id);
    if (!settings || !settings.enabled) return;

    const { action, executor, target } = entry;
    if (!executor || executor.id === OWNER_ID || executor.id === client.user.id) return;

    const isMod = guild.members.cache.get(executor.id)?.permissions.has(PermissionsBitField.Flags.Administrator);
    if (isMod) return;

    let trigger = false;
    let reason = '⚠️ NUKE ACTION DETECTED';

    switch (action) {
        case AuditLogEvent.ChannelCreate:
        case AuditLogEvent.ChannelDelete:
        case AuditLogEvent.ChannelUpdate:
            if (settings.antiChannelCreate || settings.antiChannelDelete || settings.antiChannelUpdate) trigger = true;
            break;
        case AuditLogEvent.RoleCreate:
        case AuditLogEvent.RoleDelete:
        case AuditLogEvent.RoleUpdate:
            if (settings.antiRoleCreate || settings.antiRoleDelete || settings.antiRoleUpdate) trigger = true;
            break;
        case AuditLogEvent.MemberBanAdd:
        case AuditLogEvent.MemberKick:
            if (settings.antiBan || settings.antiKick) trigger = true;
            break;
        case AuditLogEvent.WebhookCreate:
        case AuditLogEvent.WebhookDelete:
            if (settings.antiWebhook) trigger = true;
            break;
        case AuditLogEvent.GuildUpdate:
            if (settings.antiGuildUpdate) trigger = true;
            break;
    }

    if (trigger) {
        try {
            const member = guild.members.cache.get(executor.id);
            if (member) {
                await member.ban({ reason: reason });
                logEvent(guild, `🚨 **SECURITY ACTION:** Banned ${executor.tag} | ${reason}`);
            }
        } catch (e) {}
    }
});

// 📌 ✨ ANIMATED WELCOME SYSTEM
client.on(Events.GuildMemberAdd, async (member) => {
    const raid = raidProtection.get(member.guild.id);
    if (raid?.enabled) {
        const now = Date.now();
        raid.joins.push(now);
        raid.joins = raid.joins.filter(t => now - t < raid.timeWindow);
        if (raid.joins.length > raid.joinLimit) {
            member.guild.channels.cache.forEach(ch => {
                if (ch.isTextBased()) ch.permissionOverwrites.edit(member.guild.id, { SendMessages: false }).catch(()=>{});
            });
            try { await member.ban({ reason: 'Raid Protection' }); } catch (e) {}
        }
    }

    // ✨ SUPER ANIMATED WELCOME MESSAGE
    try {
        const set = guildSettings.get(member.guild.id);
        if(set?.welcome) {
            const msg = set.welcome.replace(/{user}/g,`<@${member.id}>`).replace(/{server}/g,member.guild.name);
            const emb = new EmbedBuilder()
                .setTitle(`👋 NAGDAGDAG NG ISANG MAGANDANG MIYEMBRO!`)
                .setDescription(`**Maligayang Pagdating, ${member.user.username}!** 🎉\n\n${msg}\n\n> 🚀 Huwag kalimutang mag-verify at kumuha ng roles!`)
                .setColor('#FF00FF')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setImage(ANIMATED_WELCOME) // ✅ ANIMATED GIF
                .setFooter({ text: `Member #${member.guild.memberCount} • AZURA SYSTEM` })
                .setTimestamp();
                
            const ch = member.guild.systemChannel || member.guild.channels.cache.find(c=>c.type===ChannelType.GuildText);
            if(ch) ch.send({embeds:[emb]}).catch(()=>{});
        }
    } catch(e){}
});

client.on(Events.GuildMemberRemove, async member => {
    try {
        const set = guildSettings.get(member.guild.id);
        if(set?.leave) {
            const msg = set.leave.replace(/{user}/g,`${member.user.tag}`).replace(/{server}/g,member.guild.name);
            const emb = new EmbedBuilder()
                .setTitle(`😢 MAY UMALIS SA ATIN...`)
                .setDescription(`**${member.user.username}** ay nagpaalam na.\n\n${msg}`)
                .setColor('#FF0000')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setImage(ANIMATED_WELCOME) // ✅ ANIMATED
                .setTimestamp();
                
            const ch = member.guild.systemChannel || member.guild.channels.cache.find(c=>c.type===ChannelType.GuildText);
            if(ch) ch.send({embeds:[emb]}).catch(()=>{});
        }
    } catch(e){}
});

// 📌 MESSAGE HANDLER & LEVELING
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // Auto Responders
    if(autoResponders.has(message.guild.id)){
        const trigger = message.content.toLowerCase().trim();
        const respos = autoResponders.get(message.guild.id);
        if (respos.has(trigger)) message.channel.send({ content: respos.get(trigger) });
    }

    // LEVELING SYSTEM
    if(!levels.has(message.guild.id)) levels.set(message.guild.id, new Map());
    const serverData = levels.get(message.guild.id);
    const uid = message.author.id;
    
    if(!serverData.has(uid)) serverData.set(uid, { xp: 0, level: 1, messages: 0, lastXp: 0 });
    
    const uData = serverData.get(uid);
    const now = Date.now();

    if (now - uData.lastXp > 60000) { 
        uData.messages++;
        const gainXP = Math.floor(Math.random() * 15) + 10;
        uData.xp += gainXP;
        uData.lastXp = now;

        const nextLevelXP = uData.level * 100;
        if(uData.xp >= nextLevelXP){
            uData.level++;
            const emb = new EmbedBuilder()
                .setTitle('🎉 LEVEL UP!')
                .setDescription(`<@${uid}> has reached **LEVEL ${uData.level}**!\n+${gainXP} XP ✨`)
                .setColor('Gold')
                .setImage(ANIMATED_WELCOME);
            message.channel.send({embeds:[emb]}).then(m=>setTimeout(()=>m.delete().catch(()=>{}),12000));
        }
    }
    serverData.set(uid,uData);

    // ✅ ANTI TOKEN GRABBER
    const tokenProtect = tokenGrabberProtection.get(message.guild.id);
    if (tokenProtect?.enabled) {
        const content = message.content.toLowerCase();
        if (tokenProtect.blockedDomains.some(domain => content.includes(domain)) || /[a-zA-Z0-9_-]{24}\.[a-zA-Z0-9_-]{6}\.[a-zA-Z0-9_-]{27}/.test(content)) {
            await message.delete().catch(() => {});
            return message.channel.send({content:`❌ <@${message.author.id}> Token grabber detected!`,ephemeral:true});
        }
    }

    // ✅ ANTI IMAGE GRABBER
    const imgProtect = imageGrabberProtection.get(message.guild.id);
    if (imgProtect?.enabled) {
        const content = message.content.toLowerCase();
        if (imgProtect.blockedDomains.some(domain => content.includes(domain))) {
            await message.delete().catch(() => {});
            return message.channel.send({content:`❌ <@${message.author.id}> Image grabber detected!`,ephemeral:true});
        }
    }
});

// 📌 LOGGING SYSTEM
client.on(Events.ChannelCreate, channel => logEvent(channel.guild, `📝 Channel Created: ${channel.name}`));
client.on(Events.ChannelDelete, channel => logEvent(channel.guild, `🗑️ Channel Deleted: ${channel.name}`));
client.on(Events.RoleCreate, role => logEvent(role.guild, `📝 Role Created: ${role.name}`));
client.on(Events.RoleDelete, role => logEvent(role.guild, `🗑️ Role Deleted: ${role.name}`));
client.on(Events.GuildMemberAdd, member => logEvent(member.guild, `👤 Member Joined: ${member.user.tag}`));
client.on(Events.GuildMemberRemove, member => logEvent(member.guild, `👤 Member Left: ${member.user.tag}`));
client.on(Events.WebhookCreate, webhook => logEvent(webhook.guild, `⚠️ Webhook Created: ${webhook.name}`));
client.on(Events.WebhookDelete, webhook => logEvent(webhook.guild, `⚠️ Webhook Deleted: ${webhook.name}`));

function logEvent(guild, message) {
    const settings = antiNuke.get(guild.id);
    if (!settings || !settings.logChannel) return;
    const ch = guild.channels.cache.get(settings.logChannel);
    if (ch) ch.send({ content: `**[SECURITY LOG]** ${message}` }).catch(() => {});
}

// ✅ VERIFICATION LOG FUNCTION
function logVerification(guild, user) {
    const settings = antiNuke.get(guild.id);
    if (!settings || !settings.logChannel) return;
    const ch = guild.channels.cache.get(settings.logChannel);
    if (ch) {
        const logEmb = new EmbedBuilder()
            .setTitle('✅ NEW VERIFICATION')
            .setDescription(`**User:** ${user.tag}\n**ID:** ${user.id}`)
            .setColor('Green')
            .setThumbnail(user.displayAvatarURL({dynamic:true}))
            .setImage(ANIMATED_WELCOME); // ✅ ANIMATED
        ch.send({embeds:[logEmb]}).catch(()=>{});
    }
}

// ==================================================
// 📌 ✅ INTERACTION HANDLER — FULL FIXED
// ==================================================
client.on(Events.InteractionCreate, async interaction => {
    try {
        // 🔹 BUTTON HANDLER (VERIFY)
        if (interaction.isButton()) {
            if (interaction.customId === 'verify_me') {
                const member = interaction.member;
                await member.roles.add(VERIFY_ROLE_ID);
                await interaction.reply({ content: '✅ **VERIFIED SUCCESSFULLY! Welcome to the server!**', ephemeral: true });
                logVerification(interaction.guild, interaction.user);
            }
        }

        // 🔹 SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const command = interaction.commandName;
            const member = interaction.member;
            const guild = interaction.guild;
            const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id === guild.ownerId;

            // --- MOD COMMANDS ---
            if (command === 'setpfp' && isAdmin) {
                const url = interaction.options.getString('url');
                await client.user.setAvatar(url);
                return interaction.reply('✅ Profile Picture Updated!');
            }
            if (command === 'setbanner' && isAdmin) {
                const url = interaction.options.getString('url');
                await client.user.setBanner(url);
                return interaction.reply('✅ Banner Updated!');
            }
            if (command === 'resetbotname' && isAdmin) {
                await client.user.setUsername('AZURA BOT');
                return interaction.reply('✅ Name Reset!');
            }
            if (command === 'setchannellog' && isAdmin) {
                const ch = interaction.options.getChannel('channel');
                if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
                antiNuke.get(guild.id).logChannel = ch.id;
                return interaction.reply(`✅ Log channel set to ${ch}`);
            }
            if (command === 'ban' && isAdmin) {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || 'No reason';
                await guild.members.ban(user, { reason });
                return interaction.reply(`✅ Banned ${user.tag} | Reason: ${reason}`);
            }
            if (command === 'kick' && isAdmin) {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || 'No reason';
                const m = guild.members.cache.get(user.id);
                if(m) await m.kick(reason);
                return interaction.reply(`✅ Kicked ${user.tag} | Reason: ${reason}`);
            }
            if (command === 'timeout' && isAdmin) {
                const user = interaction.options.getUser('user');
                const time = interaction.options.getInteger('minutes');
                const m = guild.members.cache.get(user.id);
                if(m) await m.timeout(time * 60000, 'Mod Action');
                return interaction.reply(`✅ Timed out ${user.tag} for ${time}m`);
            }
            if (command === 'unban' && isAdmin) {
                const id = interaction.options.getString('userid');
                await guild.bans.remove(id);
                return interaction.reply(`✅ Unbanned ${id}`);
            }
            if (command === 'purge' && isAdmin) {
                const amount = interaction.options.getInteger('amount');
                if(amount < 1 || amount > 100) return interaction.reply('❌ 1-100 only!');
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply(`✅ Deleted ${amount} messages`);
            }
            if (command === 'lock' && isAdmin) {
                await interaction.channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
                return interaction.reply('🔒 Channel Locked');
            }
            if (command === 'unlock' && isAdmin) {
                await interaction.channel.permissionOverwrites.edit(guild.id, { SendMessages: true });
                return interaction.reply('🔓 Channel Unlocked');
            }
            if (command === 'slowmode' && isAdmin) {
                const sec = interaction.options.getInteger('seconds') || 0;
                await interaction.channel.setRateLimitPerUser(sec);
                return interaction.reply(`🐢 Slowmode: ${sec}s`);
            }

            // ✅ /SAY COMMAND
            if (command === 'say' && isAdmin) {
                const msg = interaction.options.getString('message');
                await interaction.channel.send({ content: msg });
                return interaction.reply({ content: '✅ Message sent!', ephemeral: true });
            }

            // ✅ /EMBED COMMAND
            if (command === 'embed' && isAdmin) {
                const title = interaction.options.getString('title') || null;
                const desc = interaction.options.getString('description');
                const color = interaction.options.getString('color') || '#2F3136';
                const image = interaction.options.getString('image') || null;
                const footer = interaction.options.getString('footer') || null;

                const emb = new EmbedBuilder().setDescription(desc).setColor(color);
                if (title) emb.setTitle(title);
                if (image) emb.setImage(image);
                if (footer) emb.setFooter({ text: footer });
                emb.setTimestamp();

                await interaction.channel.send({ embeds: [emb] });
                return interaction.reply({ content: '✅ Embed Sent!', ephemeral: true });
            }

            // --- UTILITY ---
            if (command === 'afk') return interaction.reply('✅ AFK Mode Set');
            if (command === 'avatar') {
                const u = interaction.options.getUser('user') || interaction.user;
                return interaction.reply(u.displayAvatarURL({size:4096,dynamic:true}));
            }
            if (command === 'userinfo') {
                const u = interaction.options.getUser('user') || interaction.user;
                const m = guild.members.cache.get(u.id);
                const emb = new EmbedBuilder()
                    .setAuthor({name:u.tag,iconURL:u.displayAvatarURL({dynamic:true})})
                    .addFields({name:'ID',value:u.id},{name:'Joined',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'})
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }
            if (command === 'serverinfo') {
                const emb = new EmbedBuilder()
                    .setAuthor({name:guild.name,iconURL:guild.iconURL({dynamic:true})})
                    .addFields({name:'Owner',value:`<@${guild.ownerId}>`},{name:'Members',value:`${guild.memberCount}`})
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }

            // --- LEVELING ---
            if (command === 'stats' || command === 'level') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const userData = levels.get(guild.id).get(interaction.user.id) || {xp:0,level:1,messages:0};
                const emb = new EmbedBuilder()
                    .setTitle('📊 Your Stats')
                    .addFields(
                        {name:'Level',value:`${userData.level}`, inline:true},
                        {name:'XP',value:`${userData.xp} / ${userData.level * 100}`, inline:true},
                        {name:'Messages Sent',value:`${userData.messages || 0}`, inline:true}
                    )
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }
            if (command === 'rank') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const arr = Array.from(serverData, ([id, data]) => ({ id, ...data }));
                arr.sort((a,b) => b.level - a.level || b.xp - a.xp);
                const pos = arr.findIndex(u => u.id === interaction.user.id) + 1;
                const userData = serverData.get(interaction.user.id) || {xp:0,level:1};
                const emb = new EmbedBuilder()
                    .setTitle('🏅 Your Rank')
                    .setDescription(`**Rank:** #${pos} / ${arr.length}\n**Level:** ${userData.level}\n**XP:** ${userData.xp}`)
                    .setColor('Gold');
                return interaction.reply({embeds:[emb]});
            }
            if (command === 'leaderboard'){
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const arr = Array.from(serverData, ([id, data]) => ({ id, ...data }));
                arr.sort((a,b) => b.level - a.level || b.xp - a.xp);
                const top10 = arr.slice(0, 10);
                let desc = ''; 
                top10.forEach((u,i) => { desc += `**${i+1}.** <@${u.id}> | 🎖️ Lvl: ${u.level} | ✨ XP: ${u.xp}\n`; });
                const emb = new EmbedBuilder().setTitle('📈 Server Leaderboard').setDescription(desc || 'Wala pang data!').setColor('Orange');
                return interaction.reply({embeds:[emb]});
            }

            // --- SOCIAL ---
            if (command === 'instagram') return interaction.reply('📸 Instagram: @Uknown');
            if (command === 'tiktok') return interaction.reply('🎵 TikTok: @leonexclsv_');
            if (command === 'youtube') return interaction.reply('📺 YouTube: Uknown');

            // --- AUTOMOD ---
            if (command === 'automod' && isAdmin) {
                if(!automod.has(guild.id)) automod.set(guild.id, {});
                automod.get(guild.id).enabled = !automod.get(guild.id).enabled;
                return interaction.reply(`✅ Automod: ${automod.get(guild.id).enabled ? 'ON' : 'OFF'}`);
            }
            if (command === 'antinsfw' && isAdmin) {
                if(!automod.has(guild.id)) automod.set(guild.id, {});
                automod.get(guild.id).nsfw = !automod.get(guild.id).nsfw;
                return interaction.reply(`✅ Anti-NSFW: ${automod.get(guild.id).nsfw ? 'ON' : 'OFF'}`);
            }
            if (command === 'antilink' && isAdmin) {
                if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
                antiNuke.get(guild.id).antiLink = !antiNuke.get(guild.id).antiLink;
                return interaction.reply(`✅ Anti-Link: ${antiNuke.get(guild.id).antiLink ? 'ON' : 'OFF'}`);
            }

            // --- SECURITY ---
            if (command === 'antiraid' && isAdmin) {
                const data = raidProtection.get(guild.id);
                data.enabled = !data.enabled;
                return interaction.reply(`✅ Anti-Raid: ${data.enabled ? 'ON' : 'OFF'}`);
            }
            if (command === 'antitoken' && isAdmin) {
                const data = tokenGrabberProtection.get(guild.id);
                data.enabled = !data.enabled;
                return interaction.reply(`✅ Anti-Token Grabber: ${data.enabled ? 'ON' : 'OFF'}`);
            }
            if (command === 'antiimage' && isAdmin) {
                const data = imageGrabberProtection.get(guild.id);
                data.enabled = !data.enabled;
                return interaction.reply(`✅ Anti-Image Grabber: ${data.enabled ? 'ON' : 'OFF'}`);
            }

            // --- SYSTEM SETUP ---
            if (command === 'verification' && isAdmin) {
                const action = interaction.options.getString('action');
                if(action === 'setup'){
                    const emb = new EmbedBuilder()
                        .setAuthor({name:'Server Verification', iconURL: guild.iconURL({dynamic:true})})
                        .setDescription(`**✅ I-VERIFY ANG IYONG SARILI PARA MAKAPASOK!**\n\n*Pindutin ang button sa ibaba para maging buong miyembro.*`)
                        .setColor('#2f3136')
                        .setImage(ANIMATED_WELCOME) // ✅ ANIMATED VERIFY
                        .setFooter({text:'AZURA VERIFY SYSTEM • SECURED'});

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('verify_me')
                            .setLabel('✅ I-VERIFY DITO')
                            .setStyle(ButtonStyle.Success)
                    );

                    await interaction.channel.send({embeds:[emb],components:[row]});
                    return interaction.reply('✅ Verification panel sent!',{ephemeral:true});
                }
                if(action === 'disable') return interaction.reply('✅ Verification Disabled');
                if(action === 'status') return interaction.reply('✅ Verification is ACTIVE');
            }

            if (command === 'welcome' && isAdmin) {
                const action = interaction.options.getString('action');
                if(action === 'setup') {
                    guildSettings.set(guild.id, {welcome: "Welcome to the server! Enjoy your stay!"});
                    return interaction.reply('✅ Welcome System Setup & ANIMATED!');
                }
                if(action === 'disable') return interaction.reply('✅ Welcome Disabled');
                if(action === 'status') return interaction.reply('✅ Welcome Messages: ON');
            }

            if (command === 'setup' && isAdmin) {
                let logChannelId;
                if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
                
                if (!antiNuke.get(guild.id).logChannel) {
                    try {
                        const newCh = await guild.channels.create({
                            name: 'official-antinuke-logs',
                            type: ChannelType.GuildText,
                            reason: 'Anti-Nuke Auto Setup'
                        });
                        antiNuke.get(guild.id).logChannel = newCh.id;
                        logChannelId = newCh.id;
                    } catch (e) {
                        logChannelId = '❌ Failed to create';
                    }
                } else {
                    logChannelId = antiNuke.get(guild.id).logChannel;
                }

                antiNuke.get(guild.id).enabled = true;
                antiNuke.get(guild.id).punishment = 'BAN & STRIP ROLES';
                antiNuke.get(guild.id).antiBot = true;
                antiNuke.get(guild.id).antiBan = true;
                antiNuke.get(guild.id).antiKick = true;
                antiNuke.get(guild.id).antiMemberUpdate = true;
                antiNuke.get(guild.id).antiGuildUpdate = true;
                antiNuke.get(guild.id).antiChannelCreate = true;
                antiNuke.get(guild.id).antiChannelDelete = true;
                antiNuke.get(guild.id).antiChannelUpdate = true;
                antiNuke.get(guild.id).antiRoleCreate = true;
                antiNuke.get(guild.id).antiRoleDelete = true;
                antiNuke.get(guild.id).antiRoleUpdate = true;
                antiNuke.get(guild.id).antiWebhook = true;
                antiNuke.get(guild.id).antiLink = false;

                const an = antiNuke.get(guild.id);
                const emb = new EmbedBuilder()
                    .setTitle('🛡️ OfficialX Anti-Nuke Dashboard — MAX SECURITY')
                    .addFields(
                        {name:'Anti-Nuke Status', value:an.enabled ? '✅ ONLINE' : '❌ OFFLINE'},
                        {name:'Log Channel', value: `<#${logChannelId}>`},
                        {name:'Punishment', value:an.punishment},
                        {name:'\u200b', value:'**SECURITY FEATURES:**'},
                        {name:'Anti-Bot', value:an.antiBot ? '✅' : '❌', inline:true},
                        {name:'Anti-Ban', value:an.antiBan ? '✅' : '❌', inline:true},
                        {name:'Anti-Kick', value:an.antiKick ? '✅' : '❌', inline:true},
                        {name:'Anti-Member Update', value:an.antiMemberUpdate ? '✅' : '❌', inline:true},
                        {name:'Anti-Guild Update', value:an.antiGuildUpdate ? '✅' : '❌', inline:true},
                        {name:'Anti-Channel Create', value:an.antiChannelCreate ? '✅' : '❌', inline:true},
                        {name:'Anti-Channel Delete', value:an.antiChannelDelete ? '✅' : '❌', inline:true},
                        {name:'Anti-Channel Update', value:an.antiChannelUpdate ? '✅' : '❌', inline:true},
                        {name:'Anti-Role Create', value:an.antiRoleCreate ? '✅' : '❌', inline:true},
                        {name:'Anti-Role Delete', value:an.antiRoleDelete ? '✅' : '❌', inline:true},
                        {name:'Anti-Role Update', value:an.antiRoleUpdate ? '✅' : '❌', inline:true},
                        {name:'Anti-Webhook', value:an.antiWebhook ? '✅' : '❌', inline:true},
                        {name:'Anti-Raid', value:raidProtection.get(guild.id).enabled ? '✅' : '❌', inline:true},
                        {name:'Anti-Token Grabber', value:tokenGrabberProtection.get(guild.id).enabled ? '✅' : '❌', inline:true},
                        {name:'Anti-Image Grabber', value:imageGrabberProtection.get(guild.id).enabled ? '✅' : '❌', inline:true}
                    )
                    .setColor('Red')
                    .setFooter({text:'AZURA BOT • FULLY SECURED'});
                return interaction.reply({embeds:[emb]});
            }

            if (command === 'setup-roles' && isAdmin) {
                const emb = new EmbedBuilder()
                    .setTitle('🎮 ROLE SELECTION')
                    .setDescription('Select your favorite game to get role!')
                    .setColor('Blue');

                const row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('role_select')
                        .setPlaceholder('Choose your game role...')
                        .addOptions([
                            { label: 'FiveM', value: ROLES.FIVEM, description: 'Get FiveM Role', emoji: '🚗' },
                            { label: 'Roblox', value: ROLES.ROBLOX, description: 'Get Roblox Role', emoji: '🧱' },
                            { label: 'Valorant', value: ROLES.VALORANT, description: 'Get Valorant Role', emoji: '🔫' },
                            { label: '18+', value: ROLES.EIGHTEEN_PLUS, description: 'Get 18+ Access', emoji: '🔞' }
                        ])
                );

                await interaction.channel.send({embeds:[emb], components:[row]});
                return interaction.reply({content:'✅ Role Menu Sent!', ephemeral:true});
            }

            // ✅ TICKET SETUP — ANIMATED & MAGANDA
            if (command === 'ticket-setup' && isAdmin) {
                const emb=new EmbedBuilder()
                    .setTitle('🎟️ | AZURA SUPPORT TICKET')
                    .setDescription('>>> Welcome to AZURA Support!\nPlease select a category below to open a ticket.\n\n🔹 **Support** - For help & issues\n🔹 **Partnership** - For ads & collab')
                    .setColor('#2F3136')
                    .setImage(TICKET_GIF) // ✅ ANIMATED GIF
                    .setThumbnail(BANNER_URL)
                    .setFooter({text:'AZURA BOT • OFFICIAL SERVES', iconURL:BANNER_URL});
                
                const row=new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('📩 SUPPORT').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('btn_ticket_partner').setLabel('🤝 PARTNERSHIP').setStyle(ButtonStyle.Secondary)
                );
                await interaction.channel.send({embeds:[emb],components:[row]});
                return interaction.reply({content:'✅ Ticket System Setup Complete! ANIMATED ✨', ephemeral:true});
            }

            // ✅ DATING SYSTEM
            if (command === 'dating-setup') {
                const name = interaction.options.getString('name');
                const age = interaction.options.getInteger('age');
                const gender = interaction.options.getString('gender');
                const bio = interaction.options.getString('bio');
                const image = interaction.options.getString('image') || null;

                datingProfiles.set(interaction.user.id, { name, age, gender, bio, image, likes: 0 });
                
                const emb = new EmbedBuilder()
                    .setTitle('💖 PROFILE CREATED!')
                    .setDescription(`**Name:** ${name}\n**Age:** ${age}\n**Gender:** ${gender}\n**About Me:** ${bio}`)
                    .setColor('Pink')
                    .setImage(image || ANIMATED_WELCOME);
                    
                return interaction.reply({ embeds: [emb], ephemeral: false });
            }

            if (command === 'dating-profile') {
                const user = interaction.options.getUser('user') || interaction.user;
                const profile = datingProfiles.get(user.id);
                
                if (!profile) return interaction.reply({ content: '❌ Walang profile ang user na ito! Gamitin ang `/dating-setup`', ephemeral: true });
                
                const emb = new EmbedBuilder()
                    .setTitle(`💖 ${profile.name}'s Profile`)
                    .setDescription(`**Age:** ${profile.age}\n**Gender:** ${profile.gender}\n**About:** ${profile.bio}\n❤️ **Likes:** ${profile.likes}`)
                    .setColor('Pink')
                    .setImage(profile.image || ANIMATED_WELCOME);
                    
                return interaction.reply({ embeds: [emb] });
            }

            if (command === 'dating-like') {
                const target = interaction.options.getUser('user');
                if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Hindi mo pwedeng i-like ang sarili mo!', ephemeral: true });
                
                const profile = datingProfiles.get(target.id);
                if (!profile) return interaction.reply({ content: '❌ Walang profile ang user na ito!', ephemeral: true });
                
                profile.likes += 1;
                datingProfiles.set(target.id, profile);
                
                return interaction.reply({ content: `❤️ **Nagustuhan mo ang profile ni ${target.username}!**`, ephemeral: false });
            }

            if (command === 'dating-list') {
                const allProfiles = Array.from(datingProfiles.entries());
                if (allProfiles.length === 0) return interaction.reply('❌ Wala pang profile na gumawa!');
                
                let desc = '';
                allProfiles.forEach(([id, p]) => {
                    desc += `💖 **${p.name}** • <@${id}>\n🔞 Age: ${p.age} | ❤️ Likes: ${p.likes}\n\n`;
                });
                
                const emb = new EmbedBuilder()
                    .setTitle('📋 ALL DATING PROFILES')
                    .setDescription(desc)
                    .setColor('Magenta')
                    .setImage(ANIMATED_WELCOME);
                    
                return interaction.reply({ embeds: [emb] });
            }

        }
    } catch (error) {
        console.error(error);
        interaction.reply({ content: '❌ There was an error executing this command!', ephemeral: true }).catch(()=>{});
    }
});

// 🟢 LOGIN BOT
client.login(TOKEN);
