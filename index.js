const {
    Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Events, REST, Routes,
    Partials, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 📌 ASSETS & CONFIGURATION
const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif';
const STAFF_ROLE_ID = '1508714923696455740'; 

// 📌 ROLE IDs
const ROLES = {
    FIVEM: '1508559284156235878',       
    ROBLOX: '1508559055721861271',     
    VALORANT: '1508559118913503452',     
    EIGHTEEN_PLUS: '1508559365974659172'  
};

// 📌 DATABASES (In-Memory)
const warns = new Map();
const autoResponders = new Map();
const reminders = new Map();
const guildSettings = new Map(); // Para sa Welcome/Leave
const levels = new Map(); // Para sa Level System

// 📌 BOT CONFIG & INTENTS
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User, 
        Partials.GuildMember,
        Partials.ThreadMember
    ]
});

// 🔑 CREDENTIALS
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = '1507007071634329703'; 

// 📌 SLASH COMMANDS LIST
const commands = [
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
    { name: 'warnings', description: 'Check your warnings or others' },
    { name: 'joke', description: 'Get a random joke' },
    { name: 'fact', description: 'Get a random fact' },
    { name: 'rps', description: 'Play Rock Paper Scissors with bot' },
    { 
        name: 'translate', 
        description: 'Translate text to another language', 
        options: [
            { name: 'language', type: 3, description: 'Target language (e.g. tl, en, ko)', required: true },
            { name: 'text', type: 3, description: 'Text to translate', required: true }
        ]
    },
    { 
        name: 'reminder', 
        description: 'Set a reminder', 
        options: [
            { name: 'time', type: 3, description: 'Time (e.g. 10m, 1h)', required: true },
            { name: 'message', type: 3, description: 'Reminder message', required: true }
        ]
    },
    { 
        name: 'calculator', 
        description: 'Simple math calculation', 
        options: [
            { name: 'expression', type: 3, description: 'Math expression (e.g. 2+2*5)', required: true }
        ]
    },
    { 
        name: 'time', 
        description: 'Get current time of a location', 
        options: [{ name: 'location', type: 3, description: 'City or Country', required: true }]
    },
    { 
        name: 'weather', 
        description: 'Get weather info', 
        options: [{ name: 'location', type: 3, description: 'City name', required: true }]
    },
    { 
        name: 'slowmode', 
        description: 'Set channel slowmode', 
        options: [{ name: 'seconds', type: 4, description: 'Seconds between messages', required: true }]
    },
    { 
        name: 'addrole', 
        description: 'Add role to user', 
        options: [
            { name: 'user', type: 6, description: 'User', required: true },
            { name: 'role', type: 8, description: 'Role', required: true }
        ]
    },
    { 
        name: 'removerole', 
        description: 'Remove role from user', 
        options: [
            { name: 'user', type: 6, description: 'User', required: true },
            { name: 'role', type: 8, description: 'Role', required: true }
        ]
    },
    { name: 'lockdown', description: 'Lock all channels (Admin Only)' },
    { 
        name: 'ticket', 
        description: 'Ticket Management (Admin Only)', 
        options: [
            { name: 'action', type: 3, description: 'Action', required: true, choices: [
                { name: 'add', value: 'add' },
                { name: 'remove', value: 'remove' },
                { name: 'transcript', value: 'transcript' }
            ]},
            { name: 'user', type: 6, description: 'User to add/remove', required: false }
        ]
    },
    { 
        name: 'welcome', 
        description: 'Set welcome message (Admin)', 
        options: [{ name: 'set', type: 3, description: 'Message (use {user} & {server})', required: true }]
    },
    { 
        name: 'leave', 
        description: 'Set leave message (Admin)', 
        options: [{ name: 'set', type: 3, description: 'Message (use {user} & {server})', required: true }]
    },
    { name: 'level', description: 'Check your current level & XP' },
    { name: 'rank', description: 'Show your rank card' },
    { name: 'leaderboard', description: 'Show top active members' },
    { name: 'stats', description: 'Show your server statistics' },
    { 
        name: 'say', 
        description: 'Send message as bot', 
        options: [{ name: 'message', type: 3, description: 'Content or link', required: true }] 
    },
    { 
        name: 'autorespo', 
        description: 'Manage auto-responses', 
        options: [
            { name: 'action', type: 3, description: 'Add or Remove', required: true, choices: [{ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }] },
            { name: 'trigger', type: 3, description: 'Keyword', required: true },
            { name: 'response', type: 3, description: 'Reply message', required: false }
        ]
    },
    { 
        name: 'embed', 
        description: 'Create custom embed', 
        options: [
            { name: 'title', type: 3, description: 'Title', required: true },
            { name: 'description', type: 3, description: 'Description', required: true },
            { name: 'color', type: 3, description: 'Hex Color Code', required: false }
        ]
    },
    { 
        name: 'clear', 
        description: 'Delete messages', 
        options: [{ name: 'amount', type: 4, description: 'Number of messages (1-100)', required: true }] 
    },
    { 
        name: 'kick', 
        description: 'Kick a member', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: true }] 
    },
    { 
        name: 'ban', 
        description: 'Ban a member', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: true }] 
    },
    { 
        name: 'unban', 
        description: 'Unban a user', 
        options: [{ name: 'userid', type: 3, description: 'User ID', required: true }] 
    },
    { 
        name: 'warn', 
        description: 'Warn a user', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: true }, { name: 'reason', type: 3, description: 'Reason for warning', required: true }] 
    },
    { 
        name: 'unwarn', 
        description: 'Remove warning from user', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: true }, { name: 'index', type: 4, description: 'Warning number to remove', required: true }] 
    },
    { 
        name: 'poll', 
        description: 'Create simple poll', 
        options: [{ name: 'question', type: 3, description: 'Poll question', required: true }, { name: 'option1', type: 3, description: 'Option 1', required: true }, { name: 'option2', type: 3, description: 'Option 2', required: true }] 
    },
    { 
        name: 'timeout', 
        description: 'Timeout a user', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: true }, { name: 'minutes', type: 4, description: 'Duration in minutes', required: true }] 
    },
    { name: 'lock', description: 'Lock current channel' },
    { name: 'unlock', description: 'Unlock current channel' },
    { 
        name: 'userinfo', 
        description: 'Get user information', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: false }] 
    },
    { name: 'serverinfo', description: 'Get server information' },
    { 
        name: 'avatar', 
        description: 'Get user avatar', 
        options: [{ name: 'user', type: 6, description: 'Select user', required: false }] 
    },
    { name: 'coinflip', description: 'Flip a coin' },
    { name: 'dice', description: 'Roll a dice' },
    { 
        name: '8ball', 
        description: 'Ask the magic 8Ball', 
        options: [{ name: 'question', type: 3, description: 'Your question', required: true }] 
    },
    { name: 'meme', description: 'Send random meme' }
];

// 📌 BOT READY & COMMAND REGISTRATION
client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Refreshing application commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✅ ${client.user.tag} ONLINE & WORKING!`);
    } catch (err) {
        console.error('❌ Error registering commands:', err);
    }
});

// 📌 AUTO RESPONDER + LEVELING SYSTEM
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // --- AUTO RESPONSE ---
    if(autoResponders.has(message.guild.id)){
        const trigger = message.content.toLowerCase().trim();
        const guildRespos = autoResponders.get(message.guild.id);
        if (guildRespos.has(trigger)) message.channel.send({ content: guildRespos.get(trigger) });
    }

    // --- LEVELING SYSTEM ---
    if(!levels.has(message.guild.id)) levels.set(message.guild.id, new Map());
    const serverData = levels.get(message.guild.id);
    const userID = message.author.id;

    if(!serverData.has(userID)) serverData.set(userID, { xp: 0, level: 0, messages: 0 });
    
    const userData = serverData.get(userID);
    userData.messages += 1;
    const xpGain = Math.floor(Math.random() * 10) + 5;
    userData.xp += xpGain;

    const nextLevel = 50 * (userData.level * userData.level) + 50;

    if(userData.xp >= nextLevel){
        userData.level += 1;
        userData.xp = 0;
        const lvlEmbed = new EmbedBuilder()
            .setTitle('🎉 LEVEL UP!')
            .setDescription(`Maligayang pagbati <@${userID}>!\nUmakyat ka na sa **Level ${userData.level}**!`)
            .setColor('Gold');
        message.channel.send({embeds: [lvlEmbed]}).then(m => setTimeout(() => m.delete().catch(()=>{}), 10000));
    }
    serverData.set(userID, userData);
});

// 📌 WELCOME & LEAVE EVENT
client.on(Events.GuildMemberAdd, async member => {
    try {
        const settings = guildSettings.get(member.guild.id);
        if(settings && settings.welcome) {
            const msg = settings.welcome.replace(/{user}/g, `<@${member.id}>`).replace(/{server}/g, member.guild.name);
            const emb = new EmbedBuilder().setTitle('👤 Bagong Miyembro!').setDescription(msg).setColor('Green');
            const channel = member.guild.systemChannel || member.guild.channels.cache.find(ch => ch.type === ChannelType.GuildText);
            if(channel) await channel.send({embeds: [emb]}).catch(()=>{});
        }
    } catch (e) {
        console.log("Error sa welcome message:", e)
    }
});

client.on(Events.GuildMemberRemove, async member => {
    try {
        const settings = guildSettings.get(member.guild.id);
        if(settings && settings.leave) {
            const msg = settings.leave.replace(/{user}/g, `${member.user.tag}`).replace(/{server}/g, member.guild.name);
            const emb = new EmbedBuilder().setTitle('😢 Umalis ang Miyembro').setDescription(msg).setColor('Red');
            const channel = member.guild.systemChannel || member.guild.channels.cache.find(ch => ch.type === ChannelType.GuildText);
            if(channel) await channel.send({embeds: [emb]}).catch(()=>{});
        }
    } catch (e) {
        console.log("Error sa leave message:", e)
    }
});

// 📌 MAIN INTERACTION HANDLER
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
    const { guild, member, commandName, options } = interaction;

    try {
        // ========================
        // 📌 SLASH COMMANDS
        // ========================
        if (interaction.isChatInputCommand()) {

            if (commandName === 'ping') {
                return interaction.reply({ content: `🏓 Pong! Latency: **${client.ws.ping}ms**`, ephemeral: false });
            }

            if (commandName === 'uptime') {
                const days = Math.floor(client.uptime / 86400000);
                const hours = Math.floor(client.uptime / 3600000) % 24;
                const minutes = Math.floor(client.uptime / 60000) % 60;
                const seconds = Math.floor(client.uptime / 1000) % 60;
                return interaction.reply({ content: `⏱️ Uptime: **${days}d ${hours}h ${minutes}m ${seconds}s**` });
            }

            if (commandName === 'warnings') {
                const user = options.getUser('user') || interaction.user;
                if(!warns.has(user.id) || warns.get(user.id).length === 0) 
                    return interaction.reply({content: `✅ **${user.tag}** walang nakalistang babala.`, ephemeral: true});
                
                const list = warns.get(user.id).map((w,i) => `**${i+1}.** ${w.reason} *(By: ${w.by})*`).join('\n');
                const emb = new EmbedBuilder().setTitle(`⚠️ Babala ni ${user.username}`).setDescription(list).setColor('Yellow');
                return interaction.reply({embeds:[emb]});
            }

            if (commandName === 'joke') {
                const jokes = [
                    "Bakit laging pagod ang kalendaryo? Kasi laging may date! 📅😂",
                    "Anong isda ang hindi nababasa? Tuyo! 🐟😆",
                    "Ano ang sinabi ng 0 sa 8? 'Ganda ng sinturon mo ah!' 👀",
                    "Bakit maswerte ang kalabaw? Kasi siya ang 'bida' sa bukid! 🐃"
                ];
                return interaction.reply({content: jokes[Math.floor(Math.random() * jokes.length)]});
            }

            if (commandName === 'fact') {
                const facts = [
                    "Ang saging ay berries, pero ang strawberry ay hindi! 🍌",
                    "Ang puso ng hipon ay nasa ulo niya! 🦐",
                    "Ang mga tao ay nakikita ang kulay na pula, asul, at berde lang. Ang ibang kulay ay halo-halo lang 'yan!",
                    "Ang araw ay binubuo ng 91% na Hydrogen. ☀️"
                ];
                return interaction.reply({content: facts[Math.floor(Math.random() * facts.length)]});
            }

            if (commandName === 'rps') {
                const choices = ['Bato 🪨', 'Gunting ✂️', 'Papel 📄'];
                const botChoice = choices[Math.floor(Math.random() * choices.length)];
                return interaction.reply({content: `Ako ay pumili ng: **${botChoice}**\nItype sa chat ang iyong sagot: *bato, gunting, o papel*`});
            }

            if (commandName === 'translate') {
                const lang = options.getString('language');
                const text = options.getString('text');
                try {
                    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`);
                    return interaction.reply({content: `📝 **Isinalin:** ${res.data.responseData.translatedText}`});
                } catch {
                    return interaction.reply({content: '❌ Hindi maisalin, subukan ulit.', ephemeral:true});
                }
            }

            if (commandName === 'reminder') {
                const timeStr = options.getString('time');
                const msg = options.getString('message');
                let timeMs = 0;
                if(timeStr.includes('m')) timeMs = parseInt(timeStr) * 60000;
                if(timeStr.includes('h')) timeMs = parseInt(timeStr) * 3600000;
                if(timeStr.includes('d')) timeMs = parseInt(timeStr) * 86400000;

                if(timeMs < 60000) return interaction.reply({content: '❌ Dapat higit sa 1 minuto ang oras.', ephemeral:true});
                
                interaction.reply({content: `⏰ Paalala naitakda! Magpapaalala ako sa loob ng ${timeStr}.`, ephemeral:true});
                setTimeout(() => {
                    interaction.followUp({content: `<@${interaction.user.id}> ⏰ **PAALALA:** ${msg}`});
                }, timeMs);
            }

            if (commandName === 'calculator') {
                const exp = options.getString('expression');
                try {
                    const result = eval(exp);
                    return interaction.reply({content: `🧮 **Sagot:** ${result}`});
                } catch {
                    return interaction.reply({content: '❌ Mali ang pormula.', ephemeral:true});
                }
            }

            if (commandName === 'time' || commandName === 'weather') {
                return interaction.reply({content: `ℹ️ Para sa eksaktong oras o panahon, bisitahin ang Google/PAGASA.`, ephemeral:true});
            }

            if (commandName === 'slowmode') {
                if(!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content:'❌ Wala kang pahintulot.', ephemeral:true});
                const sec = options.getInteger('seconds');
                await interaction.channel.setRateLimitPerUser(sec);
                return interaction.reply({content: `🐢 Slowmode itinakda sa **${sec} segundo**.`});
            }

            if (commandName === 'addrole' || commandName === 'removerole') {
                if(!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content:'❌ Wala kang pahintulot.', ephemeral:true});
                const user = options.getUser('user');
                const role = options.getRole('role');
                const memb = guild.members.cache.get(user.id);

                if(role.position >= member.roles.highest.position) return interaction.reply({content:'❌ Hindi mo maaring galawin ang role na ito.', ephemeral:true});

                if(commandName === 'addrole') {
                    await memb.roles.add(role);
                    return interaction.reply({content: `✅ Idinagdag ang **${role.name}** kay **${user.tag}**`});
                } else {
                    await memb.roles.remove(role);
                    return interaction.reply({content: `✅ Tinanggal ang **${role.name}** kay **${user.tag}**`});
                }
            }

            if (commandName === 'lockdown') {
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content:'❌ Admin lang pwede nito.', ephemeral:true});
                const allChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
                allChannels.forEach(async ch => await ch.permissionOverwrites.edit(guild.id, {SendMessages: false}));
                return interaction.reply({content: `🔒 **LOCKDOWN AKTIBO** - Lahat ng channel ay nakasara.`});
            }

            if (commandName === 'ticket') {
                const action = options.getString('action');
                const user = options.getUser('user');
                const isStaff = member.roles.cache.has(STAFF_ROLE_ID) || member.permissions.has(PermissionsBitField.Flags.Administrator);
                if(!isStaff) return interaction.reply({content:'❌ Tanging Staff lang pwede gumamit nito.', ephemeral:true});

                if(action === 'transcript') {
                    await interaction.deferReply();
                    const messages = await interaction.channel.messages.fetch({limit: 100});
                    let log = `TRANSCRIPT - ${interaction.channel.name}\n`;
                    log += `Server: ${guild.name} | Petsa: ${new Date().toLocaleString()}\n\n`;
                    messages.reverse().forEach(m => {
                        log += `[${new Date(m.createdTimestamp).toLocaleTimeString()}] ${m.author.tag}: ${m.content}\n`;
                    });
                    
                    const filePath = path.join(__dirname, `transcript-${interaction.channel.id}.txt`);
                    fs.writeFileSync(filePath, log);
                    const attach = new AttachmentBuilder(filePath, {name: `transcript-${interaction.channel.name}.txt`});
                    
                    await interaction.editReply({content: `✅ Heto ang transcript ng usapan:`, files: [attach]});
                    fs.unlinkSync(filePath);
                    return;
                }

                if(action === 'add' || action === 'remove') {
                    if(!user) return interaction.reply({content:'❌ Kulang ang pangalan ng user.', ephemeral:true});
                    const allow = (action === 'add');
                    await interaction.channel.permissionOverwrites.edit(user.id, {ViewChannel: allow, SendMessages: allow});
                    return interaction.reply({content: `${allow ? '✅ Idinagdag' : '❌ Tinanggal'} si **${user.tag}** sa ticket.`});
                }
            }

            if(commandName === 'welcome' || commandName === 'leave') {
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content:'❌ Admin lang pwedeng mag-set.', ephemeral:true});
                const msg = options.getString('set');
                if(!guildSettings.has(guild.id)) guildSettings.set(guild.id, {});
                const data = guildSettings.get(guild.id);

                if(commandName === 'welcome') data.welcome = msg;
                if(commandName === 'leave') data.leave = msg;
                
                guildSettings.set(guild.id, data);
                return interaction.reply({content: `✅ ${commandName.toUpperCase()} message naitakda: \n\`${msg}\``});
            }

            if(commandName === 'level' || commandName === 'rank' || commandName === 'stats') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const userData = serverData.get(interaction.user.id) || {xp:0, level:0, messages:0};
                const nextLevelXP = 50 * (userData.level * userData.level) + 50;

                if(commandName === 'level'){
                    const emb = new EmbedBuilder()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                        .setTitle('📊 Ang Iyong Antas')
                        .addFields(
                            {name: '📈 Level', value: `${userData.level}`, inline: true},
                            {name: '✨ XP', value: `${userData.xp} / ${nextLevelXP}`, inline: true},
                            {name: '💬 Mensahe', value: `${userData.messages}`, inline: true}
                        )
                        .setColor('Purple');
                    return interaction.reply({embeds: [emb]});
                }

                if(commandName === 'rank'){
                    const sorted = Array.from(serverData.values()).sort((a,b) => b.level - a.level || b.xp - a.xp);
                    const pos = sorted.findIndex(u => u.level === userData.level && u.xp === userData.xp) + 1;
                    
                    const emb = new EmbedBuilder()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                        .setTitle('🏅 Rank Card')
                        .setDescription(`Ikaw ay nasa **Posisyon #${pos}** sa server!`)
                        .addFields(
                            {name: 'Level', value: `${userData.level}`, inline: true},
                            {name: 'Progress', value: `${'█'.repeat(Math.floor((userData.xp/nextLevelXP)*10))}${'░'.repeat(10-Math.floor((userData.xp/nextLevelXP)*10))} ${Math.floor((userData.xp/nextLevelXP)*100)}%`}
                        )
                        .setColor('Gold');
                    return interaction.reply({embeds: [emb]});
                }

                if(commandName === 'stats'){
                    const emb = new EmbedBuilder()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                        .setTitle('📉 Iyong Estadistika')
                        .addFields(
                            {name: 'Petsa ng Pagpasok', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>`, inline: false},
                            {name: 'Kabuuang Mensahe', value: `${userData.messages || 0}`, inline: true},
                            {name: 'Antas', value: `${userData.level || 0}`, inline: true},
                            {name: 'Babala Natanggap', value: `${warns.get(interaction.user.id)?.length || 0}`, inline: true}
                        )
                        .setColor('Blue');
                    return interaction.reply({embeds: [emb]});
                }
            }

            if(commandName === 'leaderboard'){
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const sorted = Array.from(serverData.entries())
                    .map(([id, data]) => ({id, ...data}))
                    .sort((a,b) => b.level - a.level || b.xp - a.xp)
                    .slice(0, 10);

                let desc = '';
                sorted.forEach((u,i) => {
                    desc += `**${i+1}.** <@${u.id}> - Level: ${u.level} | XP: ${u.xp}\n`;
                });

                const emb = new EmbedBuilder()
                    .setTitle('🏆 LEADERBOARD - TOP 10')
                    .setDescription(desc || "Wala pang datos.")
                    .setColor('Orange');
                return interaction.reply({embeds: [emb]});
            }

            if (commandName === 'setup-roles') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) 
                    return interaction.reply({ content: '❌ Kailangan mo ng Administrator permission.', ephemeral: true });

                const embed = new EmbedBuilder()
                    .setTitle('SELF ROLE')
                    .setDescription('Piliin ang iyong mga role sa pamamagitan ng pag-click sa mga button sa ibaba:')
                    .setImage(BANNER_URL)
                    .setColor('#2F3136');

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('role_fivem').setLabel('FIVEM').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('role_roblox').setLabel('ROBLOX').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('role_valo').setLabel('VALO').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('role_18plus').setLabel('18+').setStyle(ButtonStyle.Danger)
                );
                await interaction.channel.send({ embeds: [embed], components: [buttons] });
                return interaction.reply({ content: '✅ Self-Role Panel matagumpay na na-setup!', ephemeral: true });
            }

            if (commandName === 'say') {
                const input = options.getString('message');
                const isMedia = /\.(gif|webp|png|jpg|jpeg|mp4)$/i.test(input) || input.startsWith('http');
                if (isMedia) {
                    await interaction.reply({ content: '✅ Media sent successfully.', ephemeral: true });
                    return interaction.channel.send({ embeds: [new EmbedBuilder().setImage(input).setColor('Random')] });
                }
                await interaction.channel.send({ content: input });
                return interaction.reply({ content: '✅ Mensahe naipadala na.', ephemeral: true });
            }

            if (commandName === 'autorespo') {
                const action = options.getString('action');
                const trigger = options.getString('trigger').toLowerCase().trim();
                const response = options.getString('response');
                if (!autoResponders.has(guild.id)) autoResponders.set(guild.id, new Map());
                
                if (action === 'add') {
                    if (!response) return interaction.reply({ content: '❌ Kailangan mong ilagay ang reply message.', ephemeral: true });
                    autoResponders.get(guild.id).set(trigger, response);
                    return interaction.reply({ content: `✅ Added auto-response: \`${trigger}\` → \`${response}\``, ephemeral: false });
                } else {
                    if (!autoResponders.get(guild.id).has(trigger)) return interaction.reply({ content: '❌ Hindi nakalagay o wala ang keyword na ito.', ephemeral: true });
                    autoResponders.get(guild.id).delete(trigger);
                    return interaction.reply({ content: `✅ Removed auto-response: \`${trigger}\``, ephemeral: false });
                }
            }

            if (commandName === 'embed') {
                const title = options.getString('title');
                const desc = options.getString('description');
                const color = options.getString('color') || '#2F3136';
                const emb = new EmbedBuilder().setTitle(title).setDescription(desc).setColor(color);
                await interaction.channel.send({ embeds: [emb] });
                return interaction.reply({ content: '✅ Embed created!', ephemeral: true });
            }

            if (commandName === 'clear') {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `ManageMessages`', ephemeral: true });
                const amount = options.getInteger('amount');
                if(amount < 1 || amount > 100) return interaction.reply({content: '❌ Dapat 1-100 lang ang bilang.', ephemeral:true});
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({content: `✅ Nabura ang **${amount}** mensahe.`, ephemeral:true});
            }

            if (commandName === 'kick') {
                if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `KickMembers`', ephemeral: true });
                const user = options.getUser('user');
                const target = guild.members.cache.get(user.id);
                if(target.roles.highest.position >= member.roles.highest.position) 
                    return interaction.reply({content: '❌ Hindi mo pwede paalisin yan, mas mataas siya sa iyo o pantay.', ephemeral:true});
                await target.kick(`By: ${member.user.tag}`);
                return interaction.reply({content: `✅ Nai-kick si **${user.tag}**`});
            }

            if (commandName === 'ban') {
                if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `BanMembers`', ephemeral: true });
                const user = options.getUser('user');
                const target = guild.members.cache.get(user.id);
                if(target.roles.highest.position >= member.roles.highest.position) 
                    return interaction.reply({content: '❌ Hindi mo pwede i-ban yan, mas mataas siya sa iyo o pantay.', ephemeral:true});
                await target.ban({ reason: `By: ${member.user.tag}` });
                return interaction.reply({content: `✅ Nai-ban si **${user.tag}**`});
            }

            if (commandName === 'unban') {
                if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `BanMembers`', ephemeral: true });
                const id = options.getString('userid');
                await guild.bans.remove(id);
                return interaction.reply({content: `✅ Na-unban na ang **${id}**`});
            }

            if (commandName === 'warn') {
                const user = options.getUser('user');
                const reason = options.getString('reason');
                if(!warns.has(user.id)) warns.set(user.id, []);
                warns.get(user.id).push({ reason: reason, by: member.user.tag, time: Date.now() });
                return interaction.reply({content: `✅ **${user.tag}** ay binigyan ng babala: *${reason}*`});
            }

            if (commandName === 'unwarn') {
                const user = options.getUser('user');
                const idx = options.getInteger('index') - 1;
                if(!warns.has(user.id) || !warns.get(user.id)[idx]) return interaction.reply({content: '❌ Walang ganyang babala o maling numero.', ephemeral:true});
                warns.get(user.id).splice(idx, 1);
                return interaction.reply({content: `✅ Tinanggal ang babala kay **${user.tag}**`});
            }

            if (commandName === 'poll') {
                const q = options.getString('question');
                const o1 = options.getString('option1');
                const o2 = options.getString('option2');
                const emb = new EmbedBuilder().setTitle(q).setDescription(`1️⃣ ${o1}\n\n2️⃣ ${o2}`).setColor('Gold');
                const msg = await interaction.reply({ embeds: [emb], fetchReply: true });
                await msg.react('1️⃣');
                await msg.react('2️⃣');
            }

            if (commandName === 'timeout') {
                if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `ModerateMembers`', ephemeral: true });
                const user = options.getUser('user');
                const mins = options.getInteger('minutes');
                const target = guild.members.cache.get(user.id);
                if(target.roles.highest.position >= member.roles.highest.position) 
                    return interaction.reply({content: '❌ Hindi mo pwede ito gawin sa kanya.', ephemeral:true});
                await target.timeout(mins * 60000, `By: ${member.user.tag}`);
                return interaction.reply({content: `✅ Naka-timeout si **${user.tag}** sa loob ng **${mins} minuto**`});
            }

            if (commandName === 'lock') {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(guild.id, {SendMessages: false});
                return interaction.reply({content: `🔒 Naka-lock na ang channel na ito.`});
            }
            if (commandName === 'unlock') {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(guild.id, {SendMessages: true});
                return interaction.reply({content: `🔓 Naka-unlock na ang channel na ito.`});
            }

            if (commandName === 'userinfo') {
                const user = options.getUser('user') || interaction.user;
                const memb = guild.members.cache.get(user.id);
                const emb = new EmbedBuilder()
                    .setAuthor({name: user.tag, iconURL: user.displayAvatarURL()})
                    .setThumbnail(user.displayAvatarURL({size:1024}))
                    .addFields(
                        {name: 'ID', value: user.id},
                        {name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:F>`},
                        {name: 'Joined Server', value: memb?.joinedTimestamp ? `<t:${Math.floor(memb.joinedTimestamp/1000)}:F>` : 'Hindi nabasa'},
                        {name: 'Roles', value: memb?.roles?.cache?.map(r=>r).join(', ') || 'Wala'}
                    ).setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }

            if (commandName === 'serverinfo') {
                const emb = new EmbedBuilder()
                    .setAuthor({name: guild.name, iconURL: guild.iconURL()})
                    .setThumbnail(guild.iconURL({size:1024}))
                    .addFields(
                        {name: 'Owner', value: `<@${guild.ownerId}>`},
                        {name: 'Members', value: `${guild.memberCount}`},
                        {name: 'Channels', value: `${guild.channels.cache.size}`},
                        {name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:F>`}
                    ).setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }

            if (commandName === 'avatar') {
                const user = options.getUser('user') || interaction.user;
                return interaction.reply({content: user.displayAvatarURL({size: 4096, dynamic: true})});
            }

            if (commandName === 'coinflip') {
                const res = Math.random() > 0.5 ? "**TAIL** 🟡" : "**HEAD** 🔴";
                return interaction.reply({content: `🪙 Bumagsak sa: ${res}`});
            }
            if (commandName === 'dice') {
                const num = Math.floor(Math.random() * 6) + 1;
                return interaction.reply({content: `🎲 Lumabas ang: **${num}**`});
            }
            if (commandName === '8ball') {
                const ans = ['Oo','Hindi','Siguro','Baka','Huwag mong gawin','Sigurado ako','Tanong mo ulit'];
                const pick = ans[Math.floor(Math.random() * ans.length)];
                return interaction.reply({content: `🎱 Sabi ng 8Ball: **${pick}**`});
            }
            if (commandName === 'meme') {
                try {
                    const res = await axios.get('https://meme-api.com/gimme');
                    const emb = new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url).setColor('Random');
                    return interaction.reply({embeds:[emb]});
                } catch {
                    return interaction.reply({content: '❌ Hindi makuha ang meme, subukan ulit.', ephemeral:true});
                }
            }

            if (commandName === 'ticket-setup') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) 
                    return interaction.reply({ content: '❌ Kailangan mo ng Administrator permission.', ephemeral: true });

                const embed = new EmbedBuilder()
                    .setTitle('🎟️ | AZURA SUPPORT SYSTEM')
                    .setDescription('Piliin ang kategorya ng iyong kailangan sa pamamagitan ng pag-click sa button sa ibaba:')
                    .setImage(TICKET_GIF)
                    .setThumbnail(BANNER_URL)
                    .setColor('#2F3136')
                    .setFooter({ text: 'AZURA BOT | Ticket System', iconURL: BANNER_URL });

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('🎟️ TICKET SUPPORT').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('btn_ticket_partnership').setLabel('🤝 PARTNERSHIP').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('btn_ticket_staff').setLabel('👔 APPLY STAFF').setStyle(ButtonStyle.Secondary)
                );
                await interaction.channel.send({ embeds: [embed], components: [buttons] });
                return interaction.reply({ content: '✅ Ticket System matagumpay na na-setup!', ephemeral: true });
            }
        }

        // ========================
        // 📌 BUTTON ACTIONS
        // ========================
        if (interaction.isButton()) {
            const handleRole = async (roleId, roleName) => {
                const role = guild.roles.cache.get(roleId);
                if (!role) return interaction.reply({ content: '❌ Role hindi nahanap, i-check ang ID sa code.', ephemeral: true });
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    return interaction.reply({ content: `❌ Tinanggal na ang role: **${roleName}**`, ephemeral: true });
                } else {
                    await member.roles.add(role);
                    return interaction.reply({ content: `✅ Idinagdag na ang role: **${roleName}**`, ephemeral: true });
                }
            };

            if (interaction.customId === 'role_fivem') await handleRole(ROLES.FIVEM, 'FIVEM');
            if (interaction.customId === 'role_roblox') await handleRole(ROLES.ROBLOX, 'ROBLOX');
            if (interaction.customId === 'role_valo') await handleRole(ROLES.VALORANT, 'VALORANT');
            if (interaction.customId === 'role_18plus') await handleRole(ROLES.EIGHTEEN_PLUS, '18+');

            if (interaction.customId === 'btn_ticket_support') {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('menu_support_options')
                        .setPlaceholder('📋 Piliin ang kategorya...')
                        .addOptions([
                            { label: '📋 ROSTER REGISTRATION', value: 'opt_roster' },
                            { label: '❓ GENERAL SUPPORT', value: 'opt_support' }
                        ])
                );
                return interaction.reply({ components: [menu], ephemeral: true });
            }

            if (interaction.customId.startsWith('btn_ticket_')) {
                let categoryName = '';
                let parentId = null;

                if (interaction.customId === 'btn_ticket_support') { categoryName = 'Support'; parentId = null; }
                if (interaction.customId === 'btn_ticket_partnership') { categoryName = 'Partnership'; parentId = null; }
                if (interaction.customId === 'btn_ticket_staff') { categoryName = 'Staff Application'; parentId = null; }

                const channelName = `ticket-${categoryName.toLowerCase().replace(/\s/g, '-')}-${interaction.user.username}`;
                
                const newChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: parentId,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { 
                            id: interaction.user.id, 
                            allow: [
                                PermissionsBitField.Flags.ViewChannel, 
                                PermissionsBitField.Flags.SendMessages, 
                                PermissionsBitField.Flags.ReadMessageHistory
                            ] 
                        },
                        { 
                            id: STAFF_ROLE_ID, 
                            allow: [
                                PermissionsBitField.Flags.ViewChannel, 
                                PermissionsBitField.Flags.SendMessages, 
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ManageChannels
                            ] 
                        },
                        { 
                            id: client.user.id, 
                            allow: [
                                PermissionsBitField.Flags.ViewChannel, 
                                PermissionsBitField.Flags.SendMessages, 
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ManageChannels
                            ] 
                        }
                    ]
                });

                const embTicket = new EmbedBuilder()
                    .setTitle(`🎟️ TICKET: ${categoryName}`)
                    .setDescription(`Kamusta <@${interaction.user.id}>!\nIsulat dito ang iyong kailangan at lalapitan ka agad ng Staff.`)
                    .setColor('Green');

                const closeBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger)
                );

                await newChannel.send({ embeds: [embTicket], components: [closeBtn] });
                return interaction.reply({ content: `✅ Ticket ginawa: <#${newChannel.id}>`, ephemeral: true });
            }

            if (interaction.customId === 'ticket_close') {
                if(!member.roles.cache.has(STAFF_ROLE_ID) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) 
                    return interaction.reply({content:'❌ Staff lang pwedeng magsara.', ephemeral:true});
                
                await interaction.reply({content: '⏳ Isinasara ang ticket...'});
                setTimeout(() => interaction.channel.delete().catch(()=>{}), 3000);
            }
        }

        // ========================
        // 📌 MENU SELECT ACTIONS
        // ========================
        if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'menu_support_options') {
        const val = interaction.values[0];

        let cat = '';
        if (val === 'opt_roster') cat = 'Roster Registration';
        if (val === 'opt_support') cat = 'General Support';

        const channelName = `ticket-${cat.toLowerCase().replace(/\s/g, '-')}-${interaction.user.username}`;

        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                               {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }
            ]
        });

        return interaction.reply({
            content: `✅ Ticket created: <#${newChannel.id}>`,
            ephemeral: true
        });
    }
}
    } catch (err) {
        console.error(err);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: '❌ Nagkaroon ng error.',
                ephemeral: true
            }).catch(() => {});
        } else {
            await interaction.reply({
                content: '❌ Nagkaroon ng error.',
                ephemeral: true
            }).catch(() => {});
        }
    }
});

client.login(TOKEN);
