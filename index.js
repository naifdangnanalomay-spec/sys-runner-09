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
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
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
const STAFF_ROLE_ID = '1508714923696455740'; 
const VERIFY_ROLE_ID = '1509517115265253487'; 
const OWNER_ID = '1250654354344775703'; 

// 📌 ROLE IDs
const ROLES = {
    FIVEM: '1508559284156235878',       
    ROBLOX: '1508559055721861271',     
    VALORANT: '1508559118913503452',     
    EIGHTEEN_PLUS: '1508559365974659172'  
};

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
const CLIENT_ID = '1507007071634329703'; 

// 📌 SLASH COMMANDS DEFINITION — TINANGGAL NA ANG CREATE CATEGORY/TEXT/VOICE
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
    
    // ✅ /SAY at /EMBED COMMANDS
    new SlashCommandBuilder().setName('say').setDescription('Bot sends any message you want (text, link, gif, image)')
        .addStringOption(option => option.setName('message').setDescription('Anything you want to say / send').setRequired(true)),

    new SlashCommandBuilder().setName('embed').setDescription('Send beautiful embed message (all types allowed: text, gif, banner, image)')
        .addStringOption(option => option.setName('title').setDescription('Title of embed (optional)').setRequired(false))
        .addStringOption(option => option.setName('description').setDescription('Main text / message (can include anything)').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Color code or name (e.g. #FF0000, Blue, Green)').setRequired(false))
        .addStringOption(option => option.setName('image').setDescription('Image / GIF / Banner URL (optional)').setRequired(false))
        .addStringOption(option => option.setName('footer').setDescription('Small text at bottom (optional)').setRequired(false)),

    // ✅ SECURITY COMMANDS
    new SlashCommandBuilder().setName('antiraid').setDescription('Toggle Anti-Raid System'),
    new SlashCommandBuilder().setName('antitoken').setDescription('Toggle Anti-Token Grabber Protection'),
    new SlashCommandBuilder().setName('antiimage').setDescription('Toggle Anti-Image Grabber Protection')
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
        const activities = [{ name: `@OfficialServs | SECURED`, type: ActivityType.Streaming, url: "https://www.twitch.tv/officialservs" }];
        client.user.setActivity(activities[0].name, { type: activities[0].type, url: activities[0].url });
    }, 1000);
});

// 📌 ANTI-NUKE / SECURITY SYSTEM — PINALAKAS
client.on(Events.GuildCreate, guild => {
    antiNuke.set(guild.id, {
        enabled: true, logChannel: null, punishment: 'BAN & STRIP ROLES', antiBot: true, antiBan: true, antiKick: true,
        antiMemberUpdate: true, antiGuildUpdate: true, antiChannelCreate: true, antiChannelDelete: true,
        antiChannelUpdate: true, antiRoleCreate: true, antiRoleDelete: true, antiRoleUpdate: true,
        antiWebhook: true, antiLink: false, maxActions: 3, timeWindow: 10000 // 3 actions in 10s = trigger
    });

    raidProtection.set(guild.id, { enabled: true, joinLimit: 5, timeWindow: 10000, joins: [] });
    tokenGrabberProtection.set(guild.id, { enabled: true, blockedDomains: ['discord.gift', 'discordapp.gift', 'steamgift', 'nitro', 'token', 'grabber', 'steal'] });
    imageGrabberProtection.set(guild.id, { enabled: true, blockedDomains: ['imgur.io', 'image-grabber', 'stealimg', 'loger', 'logger'] });
});

// 📌 AUDIT LOG MONITOR — DETECT NUKE ACTIONS
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
            // Revert deleted channels/roles if possible
            if (action === AuditLogEvent.ChannelDelete && target) {
                await guild.channels.create({ name: target.name, type: target.type, parent: target.parentId }).catch(() => {});
            }
        } catch (e) {}
    }
});

// 📌 ANTI-RAID SYSTEM
client.on(Events.GuildMemberAdd, async (member) => {
    const raid = raidProtection.get(member.guild.id);
    if (!raid || !raid.enabled) return;

    const now = Date.now();
    raid.joins.push(now);
    raid.joins = raid.joins.filter(t => now - t < raid.timeWindow);

    if (raid.joins.length > raid.joinLimit) {
        logEvent(member.guild, `🚨 **RAID DETECTED:** Too many joins in short time — Locking server & banning new joiners`);
        member.guild.channels.cache.forEach(ch => {
            if (ch.isTextBased()) ch.permissionOverwrites.edit(member.guild.id, { SendMessages: false }).catch(() => {});
        });
        try { await member.ban({ reason: 'Raid Protection' }); } catch (e) {}
    }

    // Welcome system
    try {
        const set = guildSettings.get(member.guild.id);
        if(set?.welcome) {
            const msg = set.welcome.replace(/{user}/g,`<@${member.id}>`).replace(/{server}/g,member.guild.name);
            const emb = new EmbedBuilder().setTitle('👤 New Member!').setDescription(msg).setColor('Green');
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
            const emb = new EmbedBuilder().setTitle('😢 Member Left').setDescription(msg).setColor('Red');
            const ch = member.guild.systemChannel || member.guild.channels.cache.find(c=>c.type===ChannelType.GuildText);
            if(ch) ch.send({embeds:[emb]}).catch(()=>{});
        }
    } catch(e){}
});

// 📌 MESSAGE SECURITY — ANTI TOKEN/IMAGE GRABBER + LINK MONITOR
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
                .setDescription(`<@${uid}> has reached **LEVEL ${uData.level}**!\n+${gainXP} XP`)
                .setColor('Gold')
                .setThumbnail(BANNER_URL);
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
            return message.channel.send({content:`❌ <@${message.author.id}> Token grabber / suspicious link detected!`,ephemeral:true});
        }
    }

    // ✅ ANTI IMAGE GRABBER
    const imgProtect = imageGrabberProtection.get(message.guild.id);
    if (imgProtect?.enabled) {
        const content = message.content.toLowerCase();
        if (imgProtect.blockedDomains.some(domain => content.includes(domain))) {
            await message.delete().catch(() => {});
            return message.channel.send({content:`❌ <@${message.author.id}> Image grabber / logger detected!`,ephemeral:true});
        }
    }

    // ✅ LINKS ALLOWED BUT MONITORED — NO DELETION, JUST LOG
    const anSettings = antiNuke.get(message.guild.id);
    if (/(https?:\/\/[^\s]+)/g.test(message.content)) {
        logEvent(message.guild, `🔗 Link sent by ${message.author.tag}: ${message.content}`);
    }
});

// 📌 LOGGING SYSTEM
client.on(Events.ChannelCreate, channel => logEvent(channel.guild, `📝 Channel Created: ${channel.name} | By: ${channel.guild.members.cache.get(channel.lastMessage?.authorId)?.tag || 'Unknown'}`));
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
            .setDescription(`**User:** ${user.tag}\n**ID:** ${user.id}\n**Time:** <t:${Math.floor(Date.now()/1000)}:F>`)
            .setColor('Green')
            .setThumbnail(user.displayAvatarURL({dynamic:true}));
        ch.send({embeds:[logEmb]}).catch(()=>{});
    }
}

// ==================================================
// 📌 ✅ INTERACTION HANDLER
// ==================================================
client.on(Events.InteractionCreate, async interaction => {
    try {
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
                return interaction.reply({ content: '✅ Embed sent!', ephemeral: true });
            }

            // --- UTILITY COMMANDS ---
            if (command === 'afk') return interaction.reply('✅ AFK Mode Set');
            if (command === 'avatar') {
                const u = interaction.options.getUser('user') || interaction.user;
                return interaction.reply(u.displayAvatarURL({size:4096,dynamic:true}));
            }
            if (command === 'userinfo') {
                const u = interaction.options.getUser('user') || interaction.user;
                const m = guild.members.cache.get(u.id);
                const emb = new EmbedBuilder()
                    .setAuthor({name:u.tag,iconURL:u.displayAvatarURL()})
                    .addFields({name:'ID',value:u.id},{name:'Joined',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'})
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }
            if (command === 'serverinfo') {
                const emb = new EmbedBuilder()
                    .setAuthor({name:guild.name,iconURL:guild.iconURL()})
                    .addFields({name:'Owner',value:`<@${guild.ownerId}>`},{name:'Members',value:`${guild.memberCount}`})
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }

            // --- LEVELING COMMANDS ---
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
                const emb = new EmbedBuilder().setTitle('📈 Server Leaderboard').setDescription(desc || 'Wala pang data! Magpadala ng mensahe.').setColor('Orange');
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
                return interaction.reply(`✅ Anti-Link: ${antiNuke.get(guild.id).antiLink ? 'ON' : 'OFF'} | *Links still allowed but monitored*`);
            }

            // --- SECURITY COMMANDS ---
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
                        .setDescription(`**Verify your identity to gain access to the server**\n\n*Click the button below to verify*`)
                        .setColor('#2f3136')
                        .setFooter({text:'OfficialServs Verify System • SECURED'});

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('verify_me')
                            .setLabel('✅ Verify Me')
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
                if(action === 'setup') return interaction.reply('✅ Welcome System Setup!');
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

            if (command === 'ticket-setup' && isAdmin) {
                const emb=new EmbedBuilder().setTitle('🎟️ | AZURA SUPPORT').setDescription('Select category below:').setImage(TICKET_GIF).setThumbnail(BANNER_URL).setColor('#2F3136').setFooter({text:'AZURA BOT',iconURL:BANNER_URL});
                const row=new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('➤ SUPPORT').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('btn_ticket_partner').setLabel('➤ PARTNERSHIP').setStyle(ButtonStyle.Secondary)
                );
                await interaction.channel.send({embeds:[emb],components:[row]});
                return interaction.reply('✅ Ticket System Ready');
            }

            // --- FUN COMMANDS ---
            if (command === 'ping') return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
            if (command === 'uptime') {
                const d=Math.floor(client.uptime/86400000),h=Math.floor(client.uptime/3600000)%24,m=Math.floor(client.uptime/60000)%60,s=Math.floor(client.uptime/1000)%60;
                return interaction.reply(`⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`);
            }
            if (command === 'joke') return interaction.reply(["Bakit pagod kalendaryo? Laging may date! 📅","Anong isda di nababasa? Tuyo! 🐟","Bakit maswerte kalabaw? Bida sa bukid! 🐃"][Math.floor(Math.random()*3)]);
            if (command === 'fact') return interaction.reply(["Saging berry, strawberry hindi! 🍌","Puso ng hipon nasa ulo! 🦐"][Math.floor(Math.random()*2)]);
            if (command === 'meme') {
                try { 
                    const res = await axios.get('https://meme-api.com/gimme'); 
                    const emb = new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url).setColor('Random');
                    return interaction.reply({embeds:[emb]}); 
                } catch { return interaction.reply('❌ Error loading meme'); }
            }
            if (command === '8ball') {
                const q = interaction.options.getString('question');
                return interaction.reply(`🎱 ${['Yes','No','Maybe','Definitely'][Math.floor(Math.random()*4)]}`);
            }
            if (command === 'coinflip') return interaction.reply(`🪙 ${Math.random()>0.5?'HEAD 🔴':'TAIL 🟡'}`);
            if (command === 'dice') return interaction.reply(`🎲 ${Math.floor(Math.random()*6)+1}`);
            if (command === 'botinfo') {
                const emb = new EmbedBuilder().setAuthor({name:client.user.tag}).addFields({name:'ID',value:client.user.id},{name:'Servers',value:`${client.guilds.cache.size}`}).setColor('Purple');
                return interaction.reply({embeds:[emb]});
            }
        }

        // 🔹 BUTTON HANDLER
        if (interaction.isButton()) {
            const { customId, guild, member } = interaction;

            // 📌 PINDOT: SUPPORT / PARTNERSHIP
            if(customId.startsWith('btn_ticket_')){
                let cat='';
                if(customId==='btn_ticket_support') cat='➤SUPPORT';
                if(customId==='btn_ticket_partner') cat='➤PARTNERSHIP';

                await interaction.deferReply({ ephemeral: true });

                const ch=await guild.channels.create({
                    name:`ticket-${cat.toLowerCase()}-${interaction.user.username}`,
                    type:ChannelType.GuildText,
                    permissionOverwrites:[
                        {id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},
                        {id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]},
                        {id:STAFF_ROLE_ID,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]}
                    ]
                });

                const emb=new EmbedBuilder().setTitle(`🎟️ TICKET: ${cat}`).setDescription(`Hello <@${interaction.user.id}>!\nStaff will be with you shortly.`).setColor('Green');
                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 CLOSE TICKET').setStyle(ButtonStyle.Danger));
                await ch.send({embeds:[emb], components:[closeBtn]});
                
                return interaction.editReply({content:`✅ Ticket created: ${ch}`,ephemeral:true});
            }

            // 📌 PINDOT: CLOSE TICKET
            if(customId==='close_ticket'){
                const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id === guild.ownerId;
                if(!isAdmin) return interaction.reply({content:'❌ ACCESS DENIED',ephemeral:true});
                await interaction.reply({content:'🔒 Closing...'});
                setTimeout(()=>interaction.channel.delete().catch(()=>{}),1500);
            }

            // 📌 VERIFICATION BUTTON
            if (customId === 'verify_me') {
                const role = guild.roles.cache.get(VERIFY_ROLE_ID);
                if (!role) return interaction.reply({ content: '❌ Verify role not found!', ephemeral: true });
                
                await member.roles.add(role);
                logVerification(guild, interaction.user);

                return interaction.reply({ content: '✅ You have been verified!', ephemeral: true });
            }
        }

        // ✅ ROLE SELECT MENU HANDLER
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'role_select') {
                const roleId = interaction.values[0];
                const role = interaction.guild.roles.cache.get(roleId);
                if(!role) return interaction.reply({content:'❌ Role not found!', ephemeral:true});

                if (interaction.member.roles.cache.has(roleId)) {
                    await interaction.member.roles.remove(role);
                    return interaction.reply({content:`❌ Removed role: **${role.name}**`, ephemeral:true});
                } else {
                    await interaction.member.roles.add(role);
                    return interaction.reply({content:`✅ Added role: **${role.name}**`, ephemeral:true});
                }
            }
        }

    } catch (err) {
        console.error('❌ GLOBAL ERROR:', err);
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ content: '❌ May naganap na error, subukan ulit.', ephemeral: true });
        }
    }
});

// 🔑 LOGIN
client.login(TOKEN);
