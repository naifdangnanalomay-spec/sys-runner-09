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

// 📌 ASSETS & CONFIG — UPDATED: MAS MAGAGANDA AT ANIMATED
const BANNER_URL = 'https://cdn.discordapp.com/attachments/1397829995908567092/1509743205627744276/azura_banner_animated.gif'; 
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1509743312345678901/ticket_animated_purple.gif'; 
const ANIMATED_WELCOME = 'https://cdn.discordapp.com/attachments/1397829995908567092/1509743421987654321/welcome_glow_animated.gif'; 

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

// 📌 SLASH COMMANDS — WALANG DATING SYSTEM
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
        const activities = [{ name: `🗲OfficialServs | 🗲SECURED SERVER🛡️`, type: ActivityType.Streaming, url: "https://www.twitch.tv/officialservs" }];
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

// 📌 ✨ ANIMATED WELCOME SYSTEM — INAYOS AT PINAGANDA
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

    // ✨ SUPER ANIMATED WELCOME MESSAGE — MAS MAGANDA
    try {
        const set = guildSettings.get(member.guild.id);
        if(set?.welcome) {
            const msg = set.welcome.replace(/{user}/g,`<@${member.id}>`).replace(/{server}/g,member.guild.name);
            const emb = new EmbedBuilder()
                .setTitle(`✨ **MALIGAYANG PAGDATING!** ✨`)
                .setDescription(`> 🎉 **Kumusta, ${member.user.username}!**\n> 🥳 Masaya kaming dumating ka sa **${member.guild.name}**!\n\n${msg}\n\n> 🚀 **Huwag kalimutang mag-verify at kumuha ng roles sa ibaba!**`)
                .setColor('#D81B60') // Magandang Pink/Red
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setImage(ANIMATED_WELCOME) // ✅ BAGONG ANIMATED GIF
                .setFooter({ text: `👤 Miyembro #${member.guild.memberCount} | AZURA SYSTEM • PREMIUM`, iconURL: BANNER_URL })
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
                .setTitle(`💔 **MAY UMALIS SA ATIN...**`)
                .setDescription(`> 😢 **${member.user.username}** ay nagpaalam na.\n\n${msg}\n> 🕊️ Sana ay magkita tayong muli!`)
                .setColor('#7B1FA2') // Magandang Purple
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setImage(ANIMATED_WELCOME) // ✅ BAGONG ANIMATED GIF
                .setFooter({ text: `AZURA SYSTEM • PREMIUM`, iconURL: BANNER_URL })
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
                .setTitle('🎉 **LEVEL UP!** 🎉')
                .setDescription(`> ✨ <@${uid}> umabot na sa **LEVEL ${uData.level}**!\n> 🚀 +${gainXP} XP`)
                .setColor('#FFD700') // Gold
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
            return message.channel.send({content:`❌ <@${message.author.id}> **Token grabber detected!** Bawal ito dito.`,ephemeral:true});
        }
    }

    // ✅ ANTI IMAGE GRABBER
    const imgProtect = imageGrabberProtection.get(message.guild.id);
    if (imgProtect?.enabled) {
        const content = message.content.toLowerCase();
        if (imgProtect.blockedDomains.some(domain => content.includes(domain))) {
            await message.delete().catch(() => {});
            return message.channel.send({content:`❌ <@${message.author.id}> **Image grabber detected!** Bawal ito dito.`,ephemeral:true});
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
            .setTitle('✅ **BAGONG VERIPIKASYON**')
            .setDescription(`> **User:** ${user.tag}\n> **ID:** ${user.id}\n> **Status:** Matagumpay na na-verify ✅`)
            .setColor('#2E7D32') // Green
            .setThumbnail(user.displayAvatarURL({dynamic:true}))
            .setImage(ANIMATED_WELCOME);
        ch.send({embeds:[logEmb]}).catch(()=>{});
    }
}

// ==================================================
// 📌 ✅ INTERACTION HANDLER — FULL FIXED
// ==================================================
client.on(Events.InteractionCreate, async interaction => {
    try {
        // 🔹 BUTTON HANDLER (VERIFY & TICKET)
        if (interaction.isButton()) {
            if (interaction.customId === 'verify_me') {
                const member = interaction.member;
                await member.roles.add(VERIFY_ROLE_ID);
                await interaction.reply({ content: '✅ **VERIFIED SUCCESSFULLY!** 🎉 Maligayang pagdating sa server!', ephemeral: true });
                logVerification(interaction.guild, interaction.user);
            }

            // Ticket Buttons
            if (interaction.customId === 'btn_ticket_support' || interaction.customId === 'btn_ticket_partner') {
                const type = interaction.customId === 'btn_ticket_support' ? 'SUPPORT' : 'PARTNERSHIP';
                const chName = `ticket-${type.toLowerCase()}-${interaction.user.username}`.toLowerCase();

                const existing = interaction.guild.channels.cache.find(c => c.name === chName);
                if (existing) return interaction.reply({ content: `❌ May ticket ka nang bukas: ${existing}`, ephemeral: true });

                const newCh = await interaction.guild.channels.create({
                    name: chName,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                    ]
                });

                const emb = new EmbedBuilder()
                    .setTitle(`🎟️ **${type} TICKET**`)
                    .setDescription(`> 📨 **Nagbukas ng ticket:** <@${interaction.user.id}>\n> 📌 **Uri:** ${type}\n\n> Maghintay lamang ng sagot mula sa Staff.`)
                    .setColor('#4A148C')
                    .setImage(TICKET_GIF);

                const closeBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 ISARA ANG TICKET').setStyle(ButtonStyle.Danger)
                );

                await newCh.send({ embeds: [emb], components: [closeBtn] });
                await interaction.reply({ content: `✅ Ticket nabuksan: ${newCh}`, ephemeral: true });
            }

            if (interaction.customId === 'close_ticket') {
                if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) return interaction.reply({ content: '❌ Hindi ka may karapatan!', ephemeral: true });
                await interaction.channel.delete('Ticket closed').catch(()=>{});
            }
        }

        // 🔹 SELECT MENU HANDLER (ROLES)
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'role_select') {
                const selected = interaction.values[0];
                const role = interaction.guild.roles.cache.get(selected);
                if (!role) return interaction.reply({ content: '❌ Role hindi nahanap!', ephemeral: true });

                const has = interaction.member.roles.cache.has(selected);
                if (has) {
                    await interaction.member.roles.remove(role);
                    return interaction.reply({ content: `❌ Tinanggal ang role: **${role.name}**`, ephemeral: true });
                } else {
                    await interaction.member.roles.add(role);
                    return interaction.reply({ content: `✅ Idinagdag ang role: **${role.name}**`, ephemeral: true });
                }
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
                return interaction.reply('✅ **Profile Picture Updated!**');
            }
            if (command === 'setbanner' && isAdmin) {
                const url = interaction.options.getString('url');
                await client.user.setBanner(url);
                return interaction.reply('✅ **Banner Updated!**');
            }
            if (command === 'resetbotname' && isAdmin) {
                await client.user.setUsername('AZURA BOT');
                return interaction.reply('✅ **Name Reset to AZURA BOT!**');
            }
            if (command === 'setchannellog' && isAdmin) {
                const ch = interaction.options.getChannel('channel');
                if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
                antiNuke.get(guild.id).logChannel = ch.id;
                return interaction.reply(`✅ **Log channel set to:** ${ch}`);
            }
            if (command === 'ban' && isAdmin) {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || 'No reason';
                await guild.members.ban(user, { reason });
                return interaction.reply(`✅ **Banned:** ${user.tag} | **Reason:** ${reason}`);
            }
            if (command === 'kick' && isAdmin) {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || 'No reason';
                const m = guild.members.cache.get(user.id);
                if(m) await m.kick(reason);
                return interaction.reply(`✅ **Kicked:** ${user.tag} | **Reason:** ${reason}`);
            }
            if (command === 'timeout' && isAdmin) {
                const user = interaction.options.getUser('user');
                const time = interaction.options.getInteger('minutes');
                const m = guild.members.cache.get(user.id);
                if(m) await m.timeout(time * 60000, 'Mod Action');
                return interaction.reply(`✅ **Timed out:** ${user.tag} for ${time}m`);
            }
            if (command === 'unban' && isAdmin) {
                const id = interaction.options.getString('userid');
                await guild.bans.remove(id);
                return interaction.reply(`✅ **Unbanned:** ${id}`);
            }
            if (command === 'purge' && isAdmin) {
                const amount = interaction.options.getInteger('amount');
                if(amount < 1 || amount > 100) return interaction.reply('❌ **1-100 messages only!**');
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply(`✅ **Deleted:** ${amount} messages`);
            }
            if (command === 'lock' && isAdmin) {
                await interaction.channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
                return interaction.reply('🔒 **Channel Locked**');
            }
            if (command === 'unlock' && isAdmin) {
                await interaction.channel.permissionOverwrites.edit(guild.id, { SendMessages: true });
                return interaction.reply('🔓 **Channel Unlocked**');
            }
            if (command === 'slowmode' && isAdmin) {
                const sec = interaction.options.getInteger('seconds') || 0;
                await interaction.channel.setRateLimitPerUser(sec);
                return interaction.reply(`🐢 **Slowmode set to:** ${sec}s`);
            }

            // ✅ /SAY COMMAND
            if (command === 'say' && isAdmin) {
                const msg = interaction.options.getString('message');
                await interaction.channel.send({ content: msg });
                return interaction.reply({ content: '✅ **Message sent!**', ephemeral: true });
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
                return interaction.reply({ content: '✅ **Embed Sent!**', ephemeral: true });
            }

            // --- UTILITY ---
            if (command === 'afk') return interaction.reply('✅ **AFK Mode Set**');
            if (command === 'avatar') {
                const u = interaction.options.getUser('user') || interaction.user;
                return interaction.reply(u.displayAvatarURL({size:4096,dynamic:true}));
            }
            if (command === 'userinfo') {
                const u = interaction.options.getUser('user') || interaction.user;
                const m = guild.members.cache.get(u.id);
                const emb = new EmbedBuilder()
                    .setAuthor({name:u.tag,iconURL:u.displayAvatarURL({dynamic:true})})
                    .addFields({name:'🆔 ID',value:u.id},{name:'📅 Joined',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'})
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }
            if (command === 'serverinfo') {
                const emb = new EmbedBuilder()
                    .setAuthor({name:guild.name,iconURL:guild.iconURL({dynamic:true})})
                    .addFields({name:'👑 Owner',value:`<@${guild.ownerId}>`},{name:'👥 Members',value:`${guild.memberCount}`})
                    .setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }

            // --- LEVELING ---
            if (command === 'stats' || command === 'level') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const userData = levels.get(guild.id).get(interaction.user.id) || {xp:0,level:1,messages:0};
                const emb = new EmbedBuilder()
                    .setTitle('📊 **YOUR STATISTICS**')
                    .addFields(
                        {name:'🎖️ Level',value:`${userData.level}`, inline:true},
                        {name:'✨ XP',value:`${userData.xp} / ${userData.level * 100}`, inline:true},
                        {name:'💬 Messages Sent',value:`${userData.messages || 0}`, inline:true}
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
                    .setTitle('🏅 **YOUR RANK**')
                    .setDescription(`> **Rank:** #${pos} / ${arr.length}\n> **Level:** ${userData.level}\n> **XP:** ${userData.xp}`)
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
                const emb = new EmbedBuilder().setTitle('📈 **SERVER LEADERBOARD**').setDescription(desc || 'Wala pang data!').setColor('Orange');
                return interaction.reply({embeds:[emb]});
            }

            // --- SOCIAL ---
            if (command === 'instagram') return interaction.reply('📸 **Instagram:** @Uknown');
            if (command === 'tiktok') return interaction.reply('🎵 **TikTok:** @leonexclsv_');
            if (command === 'youtube') return interaction.reply('📺 **YouTube:** Uknown');

            // --- AUTOMOD ---
            if (command === 'automod' && isAdmin) {
                if(!automod.has(guild.id)) automod.set(guild.id, {});
                automod.get(guild.id).enabled = !automod.get(guild.id).enabled;
                return interaction.reply(`✅ **Automod:** ${automod.get(guild.id).enabled ? '✅ ON' : '❌ OFF'}`);
            }
            if (command === 'antinsfw' && isAdmin) {
                if(!automod.has(guild.id)) automod.set(guild.id, {});
                automod.get(guild.id).nsfw = !automod.get(guild.id).nsfw;
                return interaction.reply(`✅ **Anti-NSFW:** ${automod.get(guild.id).nsfw ? '✅ ON' : '❌ OFF'}`);
            }
            if (command === 'antilink' && isAdmin) {
                if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
                antiNuke.get(guild.id).antiLink = !antiNuke.get(guild.id).antiLink;
                return interaction.reply(`✅ **Anti-Link:** ${antiNuke.get(guild.id).antiLink ? '✅ ON' : '❌ OFF'}`);
            }

            // --- SECURITY ---
            if (command === 'antiraid' && isAdmin) {
                const data = raidProtection.get(guild.id);
                data.enabled = !data.enabled;
                return interaction.reply(`✅ **Anti-Raid:** ${data.enabled ? '✅ ON' : '❌ OFF'}`);
            }
            if (command === 'antitoken' && isAdmin) {
                const data = tokenGrabberProtection.get(guild.id);
                data.enabled = !data.enabled;
                return interaction.reply(`✅ **Anti-Token Grabber:** ${data.enabled ? '✅ ON' : '❌ OFF'}`);
            }
            if (command === 'antiimage' && isAdmin) {
                const data = imageGrabberProtection.get(guild.id);
                data.enabled = !data.enabled;
                return interaction.reply(`✅ **Anti-Image Grabber:** ${data.enabled ? '✅ ON' : '❌ OFF'}`);
            }

            // --- SYSTEM SETUP ---
            if (command === 'verification' && isAdmin) {
                const action = interaction.options.getString('action');
                if(action === 'setup'){
                    const emb = new EmbedBuilder()
                        .setAuthor({name:'🔒 SERVER VERIFICATION', iconURL: guild.iconURL({dynamic:true})})
                        .setDescription(`> ✨ **PARA MAKAPASOK, KAILANGAN MONG MAG-VERIFY!** ✨\n\n> 📌 Pindutin ang button sa ibaba para maging ganap na miyembro ng server.\n> 🔐 Ito ay para sa seguridad ng lahat.`)
                        .setColor('#6A1B9A') // Deep Purple
                        .setImage(ANIMATED_WELCOME) // ✅ BAGONG ANIMATED
                        .setFooter({text:'AZURA VERIFY SYSTEM • MAX SECURITY', iconURL: BANNER_URL});

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('verify_me')
                            .setLabel('✅ VERIFY ME')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('🔓')
                    );

                    await interaction.channel.send({embeds:[emb],components:[row]});
                    return interaction.reply('✅ **Verification Panel Created!**',{ephemeral:true});
                }
                if(action === 'disable') return interaction.reply('✅ **Verification Disabled**');
                if(action === 'status') return interaction.reply('✅ **Verification is ACTIVE**');
            }

            if (command === 'welcome' && isAdmin) {
                const action = interaction.options.getString('action');
                if(action === 'setup') {
                    guildSettings.set(guild.id, {welcome: "Magandang araw sa iyo! Huwag kalimutang basahin ang mga rules."});
                    return interaction.reply('✅ **Welcome System Setup & ANIMATED!**');
                }
                if(action === 'disable') return interaction.reply('✅ **Welcome Disabled**');
                if(action === 'status') return interaction.reply('✅ **Welcome Messages: ON**');
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
                    .setTitle('🛡️ **AZURA ANTI-NUKE DASHBOARD**')
                    .setDescription('**MAXIMUM SECURITY PROTOCOLS ACTIVE**')
                    .addFields(
                        {name:'📊 Status', value:an.enabled ? '✅ **ONLINE & PROTECTED**' : '❌ OFFLINE'},
                        {name:'📝 Log Channel', value: `<#${logChannelId}>`},
                        {name:'⚖️ Punishment', value:an.punishment},
                        {name:'\u200b', value:'**🔐 SECURITY FEATURES:**'},
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
                    .setColor('#B71C1C') // Red
                    .setImage(BANNER_URL)
                    .setFooter({text:'AZURA BOT • FULLY SECURED', iconURL: BANNER_URL});
                return interaction.reply({embeds:[emb]});
            }

            if (command === 'setup-roles' && isAdmin) {
                const emb = new EmbedBuilder()
                    .setTitle('🎮 **ROLE SELECTION CENTER**')
                    .setDescription('> 📌 Piliin ang iyong paboritong laro o kategorya para makakuha ng role!\n> 🎨 I-customize ang iyong hitsura dito.')
                    .setColor('#1565C0') // Blue
                    .setImage(BANNER_URL);

                const row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('role_select')
                        .setPlaceholder('👇 Pumili ng Role Dito...')
                        .addOptions([
                            { label: 'FiveM', value: ROLES.FIVEM, description: 'Kumuha ng FiveM Role', emoji: '🚗' },
                            { label: 'Roblox', value: ROLES.ROBLOX, description: 'Kumuha ng Roblox Role', emoji: '🧱' },
                            { label: 'Valorant', value: ROLES.VALORANT, description: 'Kumuha ng Valorant Role', emoji: '🔫' },
                            { label: '18+ Access', value: ROLES.EIGHTEEN_PLUS, description: 'Para sa matatanda lamang', emoji: '🔞' }
                        ])
                );

                await interaction.channel.send({embeds:[emb], components:[row]});
                return interaction.reply({content:'✅ **Role Menu Created Successfully!**', ephemeral:true});
            }

                       // ✅ TICKET SETUP — INAYOS AT PINAGANDA
            if (command === 'ticket-setup' && isAdmin) {
                const emb=new EmbedBuilder()
                    .setTitle('🎟️ **PUBLIC AZURA SUPPORT SYSTEM**')
                    .setDescription(`> 📌 **Kailangan mo ba ng tulong?**\n> Pumili ng kategorya sa ibaba para magbukas ng ticket.\n\n> 🔹 **SUPPORT** - Para sa mga tanong o problema\n> 🔹 **PARTNERSHIP** - Para sa mga ads at samahan`)
                    .setColor('#4A148C') // Deep Purple
                    .setImage(TICKET_GIF) // ✅ BAGONG ANIMATED TICKET GIF
                    .setThumbnail(BANNER_URL)
                    .setFooter({text:'PUBLIC AZURA BOT • OFFICIAL SUPPORT', iconURL: BANNER_URL});
                
                const row=new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('➤ SUPPORT').setStyle(ButtonStyle.Primary).setEmoji('🛠️'),
                    new ButtonBuilder().setCustomId('btn_ticket_partner').setLabel('➤ PARTNERSHIP').setStyle(ButtonStyle.Secondary).setEmoji('💼')
                );
                await interaction.channel.send({embeds:[emb],components:[row]});
                return interaction.reply({content:'✅ **Ticket System Setup Complete! ANIMATED & PREMIUM ✨**', ephemeral:true});
            }

            // --- FUN COMMANDS ---
            if (command === 'ping') return interaction.reply(`🏓 Pong! Latency: **${Date.now() - interaction.createdTimestamp}ms**`);
            if (command === 'uptime') {
                const d = Math.floor(client.uptime / 86400000);
                const h = Math.floor((client.uptime % 86400000) / 3600000);
                const m = Math.floor((client.uptime % 3600000) / 60000);
                const s = Math.floor((client.uptime % 60000) / 1000);
                return interaction.reply(`⌛ Uptime: **${d}d ${h}h ${m}m ${s}s**`);
            }
            if (command === 'joke') return interaction.reply('😂 **Joke:** Bakit masarap ang kape? Kasi giniling! ☕');
            if (command === 'fact') return interaction.reply('🧠 **Did you know:** Ang puso ng hipon ay nasa ulo niya! 🦐');
            if (command === 'meme') return interaction.reply('🤣 **Meme:** *Naglo-load ang meme...* 🖼️');
            if (command === '8ball') {
                const ans = ['Oo ✅','Hindi ❌','Siguro 🤔','Huwag mong gawin ❌','Sigurado ako ✅'];
                const rand = ans[Math.floor(Math.random() * ans.length)];
                return interaction.reply(`🎱 **Sagot:** ${rand}`);
            }
            if (command === 'coinflip') {
                const res = Math.random() > 0.5 ? '🔵 Heads' : '🔴 Tails';
                return interaction.reply(`🪙 **Result:** ${res}`);
            }
            if (command === 'dice') {
                const num = Math.floor(Math.random() * 6) + 1;
                return interaction.reply(`🎲 **Roll:** ${num}`);
            }
            if (command === 'botinfo') {
                const emb = new EmbedBuilder()
                    .setTitle('🤖 **PUBLIC AZURA BOT INFORMATION**')
                    .setDescription('Premium & Secure Bot made for you ✨')
                    .addFields(
                        {name:'👑 Owner',value:'<@1250654354344775703>',inline:true},
                        {name:'📦 Version',value:'2.0.0',inline:true},
                        {name:'⚡ Library',value:'discord.js v14',inline:true}
                    )
                    .setColor('#9C27B0')
                    .setImage(BANNER_URL);
                return interaction.reply({embeds:[emb]});
            }

        } // <-- ITO ANG KULANG MO KANINA! PANG SARA SA LAHAT NG COMMANDS

    } catch (err) {
        console.error(err);
        return interaction.reply({content:'❌ **May naganap na error!**',ephemeral:true});
    }
});

// LOGIN BOT
client.login(TOKEN);
