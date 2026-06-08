const {
    Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, REST, Routes,
    Partials, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, Events, ActivityType
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 📌 ASSETS & CONFIG
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

// 📌 DATABASES
const warns = new Map();
const autoResponders = new Map();
const reminders = new Map();
const guildSettings = new Map();
const levels = new Map(); // ✅ Leveling System Database

// 📌 BOT SETUP
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildPresences, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.ThreadMember]
});

// 🔑 CREDENTIALS
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = '1507007071634329703'; 

// 📌 SLASH COMMANDS
const commands = [
    { name: 'commands', description: '📋 List of all available commands (Admin Only)' },
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
    { name: 'warnings', description: 'Check your warnings or others', options: [{name:'user',type:6,description:'User',required:false}]},
    { name: 'joke', description: 'Get a random joke' },
    { name: 'fact', description: 'Get a random fact' },
    { name: 'rps', description: 'Play Rock Paper Scissors with bot' },
    { name: 'translate', description: 'Translate text', options: [{name:'language',type:3,description:'Target language',required:true},{name:'text',type:3,description:'Text to translate',required:true}]},
    { name: 'reminder', description: 'Set reminder', options: [{name:'time',type:3,description:'Time (e.g. 10m)',required:true},{name:'message',type:3,description:'Reminder message',required:true}]},
    { name: 'calculator', description: 'Math calculate', options: [{name:'expression',type:3,description:'Math expression',required:true}]},
    { name: 'time', description: 'Get time', options: [{name:'location',type:3,description:'City',required:true}]},
    { name: 'weather', description: 'Get weather', options: [{name:'location',type:3,description:'City',required:true}]},
    { name: 'slowmode', description: 'Set slowmode', options: [{name:'seconds',type:4,description:'Seconds',required:true}]},
    { name: 'addrole', description: 'Add role', options: [{name:'user',type:6,description:'User',required:true},{name:'role',type:8,description:'Role',required:true}]},
    { name: 'removerole', description: 'Remove role', options: [{name:'user',type:6,description:'User',required:true},{name:'role',type:8,description:'Role',required:true}]},
    { name: 'lockdown', description: 'Lock all channels' },
    { name: 'ticket', description: 'Ticket manage', options: [{name:'action',type:3,description:'Action',required:true,choices:[{name:'add',value:'add'},{name:'remove',value:'remove'},{name:'transcript',value:'transcript'}]},{name:'user',type:6,description:'User',required:false}]},
    { name: 'welcome', description: 'Set welcome msg', options: [{name:'set',type:3,description:'Message',required:true}]},
    { name: 'leave', description: 'Set leave msg', options: [{name:'set',type:3,description:'Message',required:true}]},
    { name: 'level', description: '📊 Check your level & XP' },
    { name: 'rank', description: '🏅 Show your rank card' },
    { name: 'leaderboard', description: '📈 Top members leaderboard' },
    { name: 'stats', description: '📉 View your server stats' },
    { name: 'say', description: 'Bot say', options: [{name:'message',type:3,description:'Message',required:true}]},
    { name: 'autorespo', description: 'Auto responder', options: [{name:'action',type:3,description:'Action',required:true,choices:[{name:'Add',value:'add'},{name:'Remove',value:'remove'}]},{name:'trigger',type:3,description:'Keyword',required:true},{name:'response',type:3,description:'Reply',required:false}]},
    { name: 'embed', description: 'Make embed', options: [{name:'title',type:3,description:'Title',required:true},{name:'description',type:3,description:'Description',required:true},{name:'color',type:3,description:'Color',required:false}]},
    { name: 'clear', description: 'Delete messages', options: [{name:'amount',type:4,description:'Amount',required:true}]},
    { name: 'kick', description: 'Kick user', options: [{name:'user',type:6,description:'User',required:true}]},
    { name: 'ban', description: 'Ban user', options: [{name:'user',type:6,description:'User',required:true}]},
    { name: 'unban', description: 'Unban user', options: [{name:'userid',type:3,description:'User ID',required:true}]},
    { name: 'warn', description: 'Warn user', options: [{name:'user',type:6,description:'User',required:true},{name:'reason',type:3,description:'Reason',required:true}]},
    { name: 'unwarn', description: 'Remove warn', options: [{name:'user',type:6,description:'User',required:true},{name:'index',type:4,description:'Warn number',required:true}]},
    { name: 'poll', description: 'Make poll', options: [{name:'question',type:3,description:'Question',required:true},{name:'option1',type:3,description:'Option 1',required:true},{name:'option2',type:3,description:'Option 2',required:true}]},
    { name: 'timeout', description: 'Timeout user', options: [{name:'user',type:6,description:'User',required:true},{name:'minutes',type:4,description:'Minutes',required:true}]},
    { name: 'lock', description: 'Lock channel' },
    { name: 'unlock', description: 'Unlock channel' },
    { name: 'userinfo', description: 'User info', options: [{name:'user',type:6,description:'User',required:false}]},
    { name: 'serverinfo', description: 'Server info' },
    { name: 'avatar', description: 'Get avatar', options: [{name:'user',type:6,description:'User',required:false}]},
    { name: 'coinflip', description: 'Flip coin' },
    { name: 'dice', description: 'Roll dice' },
    { name: '8ball', description: 'Magic 8ball', options: [{name:'question',type:3,description:'Question',required:true}]},
    { name: 'meme', description: 'Random meme' },
    { name: 'dm', description: 'Send message to all members', options: [{name:'message',type:3,description:'Message to send',required:true}]},
    { name: 'botinfo', description: 'Show bot information' },
    { name: 'roleinfo', description: 'Get role info', options: [{name:'role',type:8,description:'Role',required:true}]},
    { name: 'createchannel', description: 'Create new channel', options: [{name:'name',type:3,description:'Channel Name',required:true},{name:'type',type:3,description:'text/voice',required:true,choices:[{name:'Text',value:'text'},{name:'Voice',value:'voice'}]}]},
    { name: 'deletechannel', description: 'Delete channel', options: [{name:'channel',type:7,description:'Channel',required:true}]},
    { name: 'rename', description: 'Rename channel', options: [{name:'channel',type:7,description:'Channel',required:true},{name:'newname',type:3,description:'New Name',required:true}]},
    { name: 'emojilist', description: 'List all server emojis' },
    { name: 'servericon', description: 'Get server icon' }
];

// 📌 BOT READY
client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Re-registering commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✅ ${client.user.tag} ONLINE & ALL COMMANDS LOADED!`);

        // ✅ STATUS: Tuloy-tuloy na pagbilang ng oras (Playing) at Nakapirming Pangalan (Watching)
        setInterval(() => {
            const totalSeconds = Math.floor(client.uptime / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Ito ang magpapalit-palit pero tama ang uri:
            const activities = [
                { name: timeDisplay, type: ActivityType.Playing },
                { name: 'PUBLIC AZURA', type: ActivityType.Watching }
            ];

            const current = activities[Math.floor((Date.now() / 10000) % 2)]; // magpapalit bawat 10 segundo
            client.user.setActivity(current.name, { type: current.type });

        }, 1000); // bibilang bawat 1 segundo para ma-update ang oras

    } catch (err) { console.error('❌ Error:', err); }
});

// 📌 ✅ IMPROVED LEVELING SYSTEM
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // Auto Response
    if(autoResponders.has(message.guild.id)){
        const trigger = message.content.toLowerCase().trim();
        const respos = autoResponders.get(message.guild.id);
        if (respos.has(trigger)) message.channel.send({ content: respos.get(trigger) });
    }

    // ✅ LEVEL SYSTEM - INAYOS AT TAMA NA
    if(!levels.has(message.guild.id)) levels.set(message.guild.id, new Map());
    const serverData = levels.get(message.guild.id);
    const uid = message.author.id;
    
    // Initialize user data if not exists
    if(!serverData.has(uid)) {
        serverData.set(uid, { 
            xp: 0, 
            level: 1, 
            messages: 0,
            lastXp: 0 // Anti-spam cooldown
        });
    }
    
    const uData = serverData.get(uid);
    const now = Date.now();

    // ✅ Anti-Spam: Bigyan lang ng XP bawat 1 minuto
    if (now - uData.lastXp > 60000) { 
        uData.messages++;
        const gainXP = Math.floor(Math.random() * 15) + 10; // 10-25 XP bawat mensahe
        uData.xp += gainXP;
        uData.lastXp = now;

        // ✅ Formula: XP needed = level * 100
        const nextLevelXP = uData.level * 100;

        // ✅ Level Up Check
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
});

// 📌 WELCOME & LEAVE
client.on(Events.GuildMemberAdd, async member => {
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

// 📌 MAIN HANDLER
client.on(Events.InteractionCreate, async int => {
    if (!int.isChatInputCommand() && !int.isButton() && !int.isStringSelectMenu()) return;
    const { guild, member, commandName, options } = int;

    // ✅ PERMISSION SYSTEM
    const ADMIN_COMMANDS = ['commands', 'setup-roles', 'ticket-setup', 'warnings', 'slowmode', 'addrole', 'removerole', 'lockdown', 'ticket', 'welcome', 'leave', 'say', 'autorespo', 'embed', 'clear', 'kick', 'ban', 'unban', 'warn', 'unwarn', 'poll', 'timeout', 'lock', 'unlock', 'dm', 'botinfo', 'roleinfo', 'createchannel', 'deletechannel', 'rename'];
    const MEMBER_COMMANDS = ['ping', 'uptime', 'joke', 'fact', 'rps', 'translate', 'reminder', 'calculator', 'time', 'weather', 'level', 'rank', 'leaderboard', 'stats', 'userinfo', 'serverinfo', 'avatar', 'coinflip', 'dice', '8ball', 'meme', 'emojilist', 'servericon'];

    if (int.isChatInputCommand()) {
        // Check if Admin/Owner
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id === guild.ownerId;
        
        if (ADMIN_COMMANDS.includes(commandName) && !isAdmin) {
            return int.reply({ content: '❌ **ACCESS DENIED**\nKailangan mo ng **ADMIN PERMISSION** o ikaw ang **OWNER** para gamitin ito!', ephemeral: true });
        }
        if (!ADMIN_COMMANDS.includes(commandName) && !MEMBER_COMMANDS.includes(commandName)) {
            return int.reply({ content: '❌ **COMMAND NOT AVAILABLE**', ephemeral: true });
        }
    }

    try {
        // ========================
        // COMMANDS
        // ========================
        if (int.isChatInputCommand()) {

            // ✅ /COMMANDS - LIST LAHAT NG COMMANDS
            if (commandName === 'commands') {
                const emb = new EmbedBuilder()
                    .setTitle('📋 ALL COMMANDS - AZURA BOT')
                    .setDescription('✅ **Admin/Owner:** Lahat ng commands\n✅ **Members:** Fun, Info, & Level Commands lang')
                    .setColor('#2F3136')
                    .setThumbnail(BANNER_URL)
                    .addFields(
                        { name: '🔧 MODERATION (ADMIN ONLY)', value: '`/clear`, `/kick`, `/ban`, `/unban`, `/warn`, `/unwarn`, `/timeout`, `/addrole`, `/removerole`, `/lock`, `/unlock`, `/lockdown`, `/slowmode`' },
                        { name: '⚙️ SETTINGS (ADMIN ONLY)', value: '`/setup-roles`, `/ticket-setup`, `/welcome`, `/leave`, `/autorespo`' },
                        { name: '📊 INFO & STATS (ALL)', value: '`/ping`, `/uptime`, `/userinfo`, `/serverinfo`, `/avatar`, `/servericon`, `/emojilist`, `/level`, `/rank`, `/leaderboard`, `/stats`' },
                        { name: '✨ FUN & UTILITY (ALL)', value: '`/joke`, `/fact`, `/rps`, `/translate`, `/reminder`, `/calculator`, `/time`, `/weather`, `/poll`, `/coinflip`, `/dice`, `/8ball`, `/meme`' },
                        { name: '🎟️ TICKET SYSTEM', value: '`/ticket add`, `/ticket remove`, `/ticket transcript`' },
                        { name: '📢 BROADCAST & MANAGEMENT (ADMIN ONLY)', value: '`/dm`, `/botinfo`, `/roleinfo`, `/createchannel`, `/deletechannel`, `/rename`, `/say`, `/embed`' }
                    )
                    .setFooter({ text: 'AZURA BOT • Made for your server', iconURL: BANNER_URL });
                return int.reply({ embeds: [emb], ephemeral: true });
            }

            if (commandName === 'ping') return int.reply({content:`🏓 Pong! ${client.ws.ping}ms`});

            if (commandName === 'uptime') {
                const d=Math.floor(client.uptime/86400000),h=Math.floor(client.uptime/3600000)%24,m=Math.floor(client.uptime/60000)%60,s=Math.floor(client.uptime/1000)%60;
                return int.reply({content:`⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`});
            }

            if (commandName === 'botinfo') {
                const emb = new EmbedBuilder()
                    .setAuthor({name:client.user.tag,iconURL:client.user.displayAvatarURL({size:1024})})
                    .setTitle('🤖 BOT INFORMATION')
                    .addFields(
                        {name:'Bot ID',value:client.user.id},
                        {name:'Created On',value:`<t:${Math.floor(client.user.createdTimestamp/1000)}:F>`},
                        {name:'Servers',value:`${client.guilds.cache.size}`},
                        {name:'Status',value:'✅ ONLINE | AZURA SYSTEM'}
                    )
                    .setColor('Purple');
                return int.reply({embeds:[emb]});
            }

            if (commandName === 'warnings') {
                const u = options.getUser('user') || int.user;
                if(!warns.has(u.id)||warns.get(u.id).length===0) return int.reply({content:`✅ ${u.tag} has no warnings.`,ephemeral:true});
                const list = warns.get(u.id).map((w,i)=>`**${i+1}.** ${w.reason} *(${w.by})*`).join('\n');
                return int.reply({embeds:[new EmbedBuilder().setTitle(`⚠️ Warnings: ${u.username}`).setDescription(list).setColor('Yellow')]});
            }

            if (commandName === 'joke') return int.reply({content:["Bakit pagod kalendaryo? Laging may date! 📅","Anong isda di nababasa? Tuyo! 🐟","0 to 8: 'Ganda sinturon mo!' 👀","Bakit maswerte kalabaw? Bida sa bukid! 🐃"][Math.floor(Math.random()*4)]});

            if (commandName === 'fact') return int.reply({content:["Saging berry, strawberry hindi! 🍌","Puso ng hipon nasa ulo! 🦐","Tao nakakita lang ng RGB.","Araw 91% Hydrogen. ☀️"][Math.floor(Math.random()*4)]});

            if (commandName === 'rps') return int.reply({content:`Pili ako: **${['Bato 🪨','Gunting ✂️','Papel 📄'][Math.floor(Math.random()*3)]}**\nType: bato/gunting/papel`});

            if (commandName === 'translate') {
                const l=options.getString('language'),t=options.getString('text');
                try {
                    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=auto|${l}`);
                    return int.reply({content:`📝 Translated: ${res.data.responseData.translatedText}`});
                } catch { return int.reply({content:'❌ Error',ephemeral:true}); }
            }

            if (commandName === 'reminder') {
                const t=options.getString('time'),msg=options.getString('message');
                let ms=0; if(t.includes('m'))ms=parseInt(t)*60000; if(t.includes('h'))ms=parseInt(t)*3600000; if(t.includes('d'))ms=parseInt(t)*86400000;
                if(ms<60000) return int.reply({content:'❌ Min 1min',ephemeral:true});
                int.reply({content:`⏰ Reminder set for ${t}`,ephemeral:true});
                setTimeout(()=>int.followUp({content:`<@${int.user.id}> ⏰ REMINDER: ${msg}`}),ms);
            }

            if (commandName === 'calculator') {
                try { return int.reply({content:`🧮 Result: ${eval(options.getString('expression'))}`}); }
                catch { return int.reply({content:'❌ Invalid',ephemeral:true}); }
            }

            if (commandName === 'time'||commandName==='weather') return int.reply({content:'ℹ️ Check Google/PAGASA',ephemeral:true});

            // ✅ /LEVEL - INAYOS NA
            if (commandName === 'level') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const userData = serverData.get(int.user.id) || { xp:0, level:1, messages:0 };
                const nextLvl = userData.level * 100;
                const emb = new EmbedBuilder()
                    .setAuthor({name:int.user.tag, iconURL:int.user.displayAvatarURL({size:1024})})
                    .setTitle('📊 YOUR LEVEL')
                    .addFields(
                        {name:'🏆 Level', value:`**${userData.level}**`, inline:true},
                        {name:'⚡ XP', value:`${userData.xp} / ${nextLvl}`, inline:true},
                        {name:'💬 Messages', value:`${userData.messages}`, inline:true}
                    )
                    .setColor('Purple');
                return int.reply({embeds:[emb]});
            }

            // ✅ /RANK - INAYOS NA
            if (commandName === 'rank') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const arr = Array.from(serverData.values()).map((data, idx) => ({ id: Array.from(serverData.keys())[idx], ...data }));
                arr.sort((a,b) => b.level - a.level || b.xp - a.xp);
                const pos = arr.findIndex(u => u.id === int.user.id) + 1;
                const userData = serverData.get(int.user.id) || { xp:0, level:1, messages:0 };
                const nextLvl = userData.level * 100;
                const percent = Math.floor((userData.xp / nextLvl) * 100);
                const bar = '█'.repeat(Math.floor(percent/10)) + '░'.repeat(10 - Math.floor(percent/10));

                const emb = new EmbedBuilder()
                    .setAuthor({name:int.user.tag, iconURL:int.user.displayAvatarURL({size:1024})})
                    .setTitle('🏅 RANK CARD')
                    .setDescription(`**Rank #${pos}** of ${arr.length} members`)
                    .addFields(
                        {name:'Level', value:`${userData.level}`, inline:true},
                        {name:'Progress', value:`${bar} ${percent}%`, inline:true},
                        {name:'XP', value:`${userData.xp}/${nextLvl}`, inline:true}
                    )
                    .setColor('Gold');
                return int.reply({embeds:[emb]});
            }

            // ✅ /STATS - INAYOS NA
            if (commandName === 'stats') {
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const userData = serverData.get(int.user.id) || { xp:0, level:1, messages:0 };
                const emb = new EmbedBuilder()
                    .setAuthor({name:int.user.tag, iconURL:int.user.displayAvatarURL({size:1024})})
                    .setTitle('📉 YOUR SERVER STATS')
                    .addFields(
                        {name:'📅 Joined Server', value:`<t:${Math.floor(member.joinedTimestamp/1000)}:F>`, inline:false},
                        {name:'💬 Total Messages', value:`${userData.messages}`, inline:true},
                        {name:'⚡ Total XP', value:`${userData.xp}`, inline:true},
                        {name:'🏆 Current Level', value:`${userData.level}`, inline:true},
                        {name:'⚠️ Warnings', value:`${warns.get(int.user.id)?.length || 0}`, inline:true}
                    )
                    .setColor('Blue');
                return int.reply({embeds:[emb]});
            }

            // ✅ /LEADERBOARD - INAYOS NA
            if (commandName === 'leaderboard'){
                if(!levels.has(guild.id)) levels.set(guild.id, new Map());
                const serverData = levels.get(guild.id);
                const arr = Array.from(serverData.values()).map((data, idx) => ({ id: Array.from(serverData.keys())[idx], ...data }));
                arr.sort((a,b) => b.level - a.level || b.xp - a.xp);
                const top10 = arr.slice(0,10);
                let desc = '';
                top10.forEach((u,i) => {
                    desc += `**${i+1}.** <@${u.id}> | Lvl: ${u.level} | XP: ${u.xp}\n`;
                });
                const emb = new EmbedBuilder()
                    .setTitle('📈 SERVER LEADERBOARD')
                    .setDescription(desc || 'No data yet!')
                    .setColor('Orange');
                return int.reply({embeds:[emb]});
            }

            if (commandName === 'slowmode') {
                await int.channel.setRateLimitPerUser(options.getInteger('seconds'));
                return int.reply({content:`🐢 Slowmode set to ${options.getInteger('seconds')}s`});
            }

            if (commandName === 'addrole'||commandName==='removerole') {
                const u=options.getUser('user'),r=options.getRole('role'),m=guild.members.cache.get(u.id);
                if(r.position>=member.roles.highest.position) return int.reply({content:'❌ Cannot modify higher role',ephemeral:true});
                if(commandName==='addrole'){await m.roles.add(r);return int.reply({content:`✅ Added ${r.name} to ${u.tag}`});}
                else {await m.roles.remove(r);return int.reply({content:`✅ Removed ${r.name} from ${u.tag}`});}
            }

            if (commandName === 'lockdown') {
                guild.channels.cache.filter(c=>c.type===ChannelType.GuildText).forEach(async ch=>await ch.permissionOverwrites.edit(guild.id,{SendMessages:false}));
                return int.reply({content:`🔒 LOCKDOWN ACTIVE`});
            }

            if (commandName === 'ticket') {
                const act=options.getString('action'),u=options.getUser('user');
                if(!member.roles.cache.has(STAFF_ROLE_ID)&&!member.permissions.has(PermissionsBitField.Flags.Administrator)) return int.reply({content:'❌ Staff Only',ephemeral:true});
                if(act==='transcript'){
                    await int.deferReply();
                    const msgs=await int.channel.messages.fetch({limit:100});
                    let log=`TRANSCRIPT - ${int.channel.name}\nServer: ${guild.name} | Date: ${new Date().toLocaleString()}\n\n`;
                    msgs.reverse().forEach(m=>log+=`[${new Date(m.createdTimestamp).toLocaleTimeString()}] ${m.author.tag}: ${m.content}\n`);
                    const fp=path.join(__dirname,`transcript-${int.channel.id}.txt`); fs.writeFileSync(fp,log);
                    const att=new AttachmentBuilder(fp,{name:`transcript-${int.channel.name}.txt`});
                    await int.editReply({content:`✅ Transcript:`,files:[att]}); fs.unlinkSync(fp); return;
                }
                if(act==='add'||act==='remove'){
                    if(!u) return int.reply({content:'❌ Missing User',ephemeral:true});
                    const allow=(act==='add'); await int.channel.permissionOverwrites.edit(u.id,{ViewChannel:allow,SendMessages:allow});
                    return int.reply({content:`${allow?'✅ Added':'❌ Removed'} ${u.tag} to ticket`});
                }
            }

            if (commandName === 'welcome'||commandName==='leave') {
                const msg=options.getString('set'); if(!guildSettings.has(guild.id)) guildSettings.set(guild.id,{});
                const d=guildSettings.get(guild.id); if(commandName==='welcome')d.welcome=msg;else d.leave=msg;
                guildSettings.set(guild.id,d); return int.reply({content:`✅ ${commandName.toUpperCase()} set: \n${msg}`});
            }

            if (commandName === 'setup-roles') {
                const emb=new EmbedBuilder().setTitle('SELF ROLE').setDescription('Choose roles below:').setImage(BANNER_URL).setColor('#2F3136');
                const row=new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('role_fivem').setLabel('FIVEM').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('role_roblox').setLabel('ROBLOX').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('role_valo').setLabel('VALO').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('role_18plus').setLabel('18+').setStyle(ButtonStyle.Danger)
                );
                await int.channel.send({embeds:[emb],components:[row]});
                return int.reply({content:'✅ Role Panel Sent',ephemeral:true});
            }

            if (commandName === 'say') {
                const txt=options.getString('message');
                if(/\.(gif|webp|png|jpg|jpeg|mp4)$/i.test(txt)||txt.startsWith('http')){
                    await int.reply({content:'✅ Sent',ephemeral:true});
                    return int.channel.send({embeds:[new EmbedBuilder().setImage(txt).setColor('Random')]});
                }
                await int.channel.send({content:txt});
                return int.reply({content:'✅ Sent',ephemeral:true});
            }

            if (commandName === 'autorespo') {
                const act=options.getString('action'),trig=options.getString('trigger').toLowerCase().trim(),res=options.getString('response');
                if(!autoResponders.has(guild.id)) autoResponders.set(guild.id,new Map());
                if(act==='add'){ if(!res) return int.reply({content:'❌ Missing Response',ephemeral:true}); autoResponders.get(guild.id).set(trig,res); return int.reply({content:`✅ Added: ${trig} → ${res}`}); }
                else { if(!autoResponders.get(guild.id).has(trig)) return int.reply({content:'❌ Not Found',ephemeral:true}); autoResponders.get(guild.id).delete(trig); return int.reply({content:`✅ Removed: ${trig}`}); }
            }

            if (commandName === 'embed') {
                const t=options.getString('title'),d=options.getString('description'),c=options.getString('color')||'#2F3136';
                await int.channel.send({embeds:[new EmbedBuilder().setTitle(t).setDescription(d).setColor(c)]});
                return int.reply({content:'✅ Embed Sent',ephemeral:true});
            }

            if (commandName === 'clear') {
                const a=options.getInteger('amount'); if(a<1||a>100) return int.reply({content:'❌ 1-100 only',ephemeral:true});
                await int.channel.bulkDelete(a,true);
                return int.reply({content:`✅ Deleted ${a} messages`,ephemeral:true});
            }

            if (commandName === 'kick'||commandName==='ban') {
                const perm=commandName==='kick'?PermissionsBitField.Flags.KickMembers:PermissionsBitField.Flags.BanMembers;
                const u=options.getUser('user'),m=guild.members.cache.get(u.id);
                if(m.roles.highest.position>=member.roles.highest.position) return int.reply({content:'❌ Cannot mod higher role',ephemeral:true});
                if(commandName==='kick') await m.kick(`By: ${member.user.tag}`); else await m.ban({reason:`By: ${member.user.tag}`});
                return int.reply({content:`✅ ${commandName==='kick'?'Kicked':'Banned'} ${u.tag}`});
            }

            if (commandName === 'unban') {
                await guild.bans.remove(options.getString('userid'));
                return int.reply({content:`✅ Unbanned ${options.getString('userid')}`});
            }

            if (commandName === 'warn') {
                const u=options.getUser('user'),r=options.getString('reason');
                if(!warns.has(u.id)) warns.set(u.id,[]); warns.get(u.id).push({reason:r,by:member.user.tag,time:Date.now()});
                return int.reply({content:`✅ Warned ${u.tag}: ${r}`});
            }

            if (commandName === 'unwarn') {
                const u=options.getUser('user'),i=options.getInteger('index')-1;
                if(!warns.has(u.id)||!warns.get(u.id)[i]) return int.reply({content:'❌ Invalid Warn',ephemeral:true});
                warns.get(u.id).splice(i,1); return int.reply({content:`✅ Removed warn from ${u.tag}`});
            }

            if (commandName === 'poll') {
                const q=options.getString('question'),o1=options.getString('option1'),o2=options.getString('option2');
                const emb=new EmbedBuilder().setTitle(q).setDescription(`1️⃣ ${o1}\n\n2️⃣ ${o2}`).setColor('Gold');
                const m=await int.reply({embeds:[emb],fetchReply:true}); await m.react('1️⃣'); await m.react('2️⃣');
            }

            if (commandName === 'timeout') {
                const u=options.getUser('user'),min=options.getInteger('minutes'),m=guild.members.cache.get(u.id);
                if(m.roles.highest.position>=member.roles.highest.position) return int.reply({content:'❌ Cannot mod higher role',ephemeral:true});
                await m.timeout(min*60000,`By: ${member.user.tag}`);
                return int.reply({content:`✅ Timed out ${u.tag} for ${min}m`});
            }

            if (commandName === 'lock'||commandName==='unlock') {
                const s=commandName==='lock'?false:true; await int.channel.permissionOverwrites.edit(guild.id,{SendMessages:s});
                return int.reply({content:`🔒 Channel ${s?'Unlocked':'Locked'}`});
            }

            if (commandName === 'userinfo') {
                const u=options.getUser('user')||int.user,m=guild.members.cache.get(u.id);
                const emb=new EmbedBuilder().setAuthor({name:u.tag,iconURL:u.displayAvatarURL({size:1024})}).setThumbnail(u.displayAvatarURL({size:1024})).addFields({name:'ID',value:u.id},{name:'Created',value:`<t:${Math.floor(u.createdTimestamp/1000)}:F>`},{name:'Joined',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'},{name:'Roles',value:m?.roles?.cache?.map(r=>r).join(', ')||'-'}).setColor('Blue');
                return int.reply({embeds:[emb]});
            }

            if (commandName === 'serverinfo') {
                const emb=new EmbedBuilder().setAuthor({name:guild.name,iconURL:guild.iconURL()}).setThumbnail(guild.iconURL({size:1024})).addFields({name:'Owner',value:`<@${guild.ownerId}>`},{name:'Members',value:`${guild.memberCount}`},{name:'Channels',value:`${guild.channels.cache.size}`},{name:'Created',value:`<t:${Math.floor(guild.createdTimestamp/1000)}:F>`}).setColor('Blue');
                return int.reply({embeds:[emb]});
            }

            if (commandName === 'avatar') return int.reply({content:(options.getUser('user')||int.user).displayAvatarURL({size:4096,dynamic:true})});

            if (commandName === 'servericon') return int.reply({content:guild.iconURL({size:4096,dynamic:true})||'❌ No Server Icon'});

            if (commandName === 'emojilist') {
                const emojis = guild.emojis.cache.map(e=>`<:${e.name}:${e.id}>`).join(' ')||'❌ No Emojis';
                return int.reply({content:`📋 **Server Emojis:**\n${emojis}`});
            }

            if (commandName === 'roleinfo') {
                const r = options.getRole('role');
                const emb=new EmbedBuilder().setTitle(`🎭 Role Info: ${r.name}`).addFields({name:'ID',value:r.id},{name:'Color',value:`#${r.hexColor}`},{name:'Members',value:`${r.members.size}`},{name:'Position',value:`${r.position}`}).setColor(r.color);
                return int.reply({embeds:[emb]});
            }

            if (commandName === 'createchannel') {
                const n=options.getString('name'),t=options.getString('type');
                const type = t==='text' ? ChannelType.GuildText : ChannelType.GuildVoice;
                await guild.channels.create({name:n,type:type});
                return int.reply({content:`✅ Created **${n}** (${t.toUpperCase()})`});
            }

            if (commandName === 'deletechannel') {
                const ch=options.getChannel('channel');
                await ch.delete();
                return int.reply({content:`✅ Deleted channel **${ch.name}**`});
            }

            if (commandName === 'rename') {
                const ch=options.getChannel('channel'),n=options.getString('newname');
                await ch.setName(n);
                return int.reply({content:`✅ Renamed to **${n}**`});
            }

            if (commandName === 'coinflip') return int.reply({content:`🪙 Landed on: **${Math.random()>0.5?'TAIL 🟡':'HEAD 🔴'}**`});

            if (commandName === 'dice') return int.reply({content:`🎲 Rolled: **${Math.floor(Math.random()*6)+1}**`});

            if (commandName === '8ball') return int.reply({content:`🎱 8Ball says: **${['Yes','No','Maybe','Try again','Definitely','Dont do it','Probably'][Math.floor(Math.random()*7)]}**`});

            // ✅ INAYOS NA /MEME COMMAND
            if (commandName === 'meme') {
                try { 
                    const res = await axios.get('https://meme-api.com/gimme'); 
                    return int.reply({embeds:[new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url).setColor('Random')]}); 
                } catch { 
                    return int.reply({content:'❌ Error', ephemeral: true}); 
                }
            }

            if (commandName === 'dm') {
                const msg = options.getString('message'); 
                await int.reply({content:'🔄 Nagpapadala ng mensahe sa lahat... Huwag isara!',ephemeral:true});
                const members = await guild.members.fetch(); 
                let sent = 0, fail = 0;
                for(const [id, m] of members){
                    if(m.user.bot || m.id === int.user.id) continue;
                    try { await m.send(msg); sent++; await new Promise(r=>setTimeout(r,1000)); } catch { fail++; }
                }
                return int.followUp({content:`✅ TAPOS NA!\n📤 Naipadala: ${sent}\n❌ Nabigo/Naka-off DM: ${fail}`,ephemeral:true});
            }

            if (commandName === 'ticket-setup') {
                const emb=new EmbedBuilder().setTitle('🎟️ | AZURA SUPPORT').setDescription('Select category below:').setImage(TICKET_GIF).setThumbnail(BANNER_URL).setColor('#2F3136').setFooter({text:'AZURA BOT',iconURL:BANNER_URL});
                const row=new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('🎟️ SUPPORT').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('btn_ticket_partnership').setLabel('🤝 PARTNERSHIP').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('btn_ticket_staff').setLabel('👔 APPLY STAFF').setStyle(ButtonStyle.Secondary)
                );
                await int.channel.send({embeds:[emb],components:[row]});
                return int.reply({content:'✅ Ticket System Ready',ephemeral:true});
            }
        }

        // ========================
        // BUTTONS
        // ========================
        if (int.isButton()) {
            const handleRole=async(rid,rname)=>{
                const r=guild.roles.cache.get(rid); if(!r) return int.reply({content:'❌ Role ID Error',ephemeral:true});
                if(member.roles.cache.has(r.id)){ await member.roles.remove(r); return int.reply({content:`❌ Removed ${rname}`,ephemeral:true}); }
                else { await member.roles.add(r); return int.reply({content:`✅ Added ${rname}`,ephemeral:true}); }
            };
            if(int.customId==='role_fivem') await handleRole(ROLES.FIVEM,'FIVEM');
            if(int.customId==='role_roblox') await handleRole(ROLES.ROBLOX,'ROBLOX');
            if(int.customId==='role_valo') await handleRole(ROLES.VALORANT,'VALORANT');
            if(int.customId==='role_18plus') await handleRole(ROLES.EIGHTEEN_PLUS,'18+');

            if(int.customId==='btn_ticket_support'){
                const menu=new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('menu_support').setPlaceholder('Select...').addOptions([{label:'📋 ROSTER',value:'roster'},{label:'❓ HELP',value:'help'}]));
                return int.reply({components:[menu],ephemeral:true});
            }

            if(int.customId.startsWith('btn_ticket_')){
                let cat='',pid=null;
                if(int.customId==='btn_ticket_support')cat='Support';
                if(int.customId==='btn_ticket_partnership')cat='Partnership';
                if(int.customId==='btn_ticket_staff')cat='Staff';
                const cn=`ticket-${cat.toLowerCase()}-${int.user.username}`;
                const ch=await guild.channels.create({name:cn,type:ChannelType.GuildText,parent:pid,permissionOverwrites:[{id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:int.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]},{id:STAFF_ROLE_ID,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]}]});
                const emb=new EmbedBuilder().setTitle(`🎟️ TICKET: ${cat}`).setDescription(`Hello <@${int.user.id}>!\nStaff will be with you shortly.`).setColor('Green');
                await ch.send({embeds:[emb]});
                return int.reply({content:`✅ Ticket created: ${ch}`,ephemeral:true});
            }
        }

        // ========================
        // MENUS
        // ========================
        if (int.isStringSelectMenu()) {
            if(int.customId==='menu_support'){
                const val=int.values[0];
                const ch=await guild.channels.create({name:`ticket-${val}-${int.user.username}`,type:ChannelType.GuildText,permissionOverwrites:[{id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:int.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},{id:STAFF_ROLE_ID,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}]});
                await ch.send({embeds:[new EmbedBuilder().setTitle(`🎟️ ${val.toUpperCase()} TICKET`).setDescription(`User: <@${int.user.id}>`).setColor('Blue')]});
                return int.reply({content:`✅ Channel created: ${ch}`,ephemeral:true});
            }
        }

    } catch (e) { console.error('❌ Error:',e); int.reply({content:'❌ May naganap na error, pakisubukan ulit.',ephemeral:true}); }
});

client.login(TOKEN);
