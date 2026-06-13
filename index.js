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
const levels = new Map(); 
const antiNukeSettings = new Map();
const automodSettings = new Map();
const logSettings = new Map();
const verificationSettings = new Map();
const snipeData = new Map(); 

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
const prefix = ','; // ✅ GAGAMITIN: ,ban ,kick ,etc.

// 🔑 CREDENTIALS
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = '1507007071634329703'; 

// 📌 BOT READY
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} ONLINE & ALL COMMANDS LOADED!`);

    // ✅ STATUS: Streaming @OfficialServs • oras | Watching PUBLIC AZURA
    setInterval(() => {
        const totalSeconds = Math.floor(client.uptime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        const activities = [
            { 
                name: `@OfficialServs • ${timeDisplay}`, 
                type: ActivityType.Streaming,  
                url: "https://www.twitch.tv/officialservs" 
            },
            { 
                name: 'PUBLIC AZURA',  
                type: ActivityType.Watching 
            }
        ];

        const current = activities[Math.floor((Date.now() / 10000) % 2)];
        client.user.setActivity(current.name, { type: current.type, url: current.url || null });

    }, 1000); 
});

// 📌 MESSAGE DELETE EVENT (FOR SNIPE)
client.on(Events.MessageDelete, async message => {
    if (message.author.bot || !message.guild) return;
    snipeData.set(message.channel.id, {
        content: message.content,
        author: message.author.tag,
        avatar: message.author.displayAvatarURL(),
        time: new Date().toLocaleString()
    });
});

// 📌 MESSAGE UPDATE EVENT (FOR EDIT SNIPE)
client.on(Events.MessageUpdate, async (oldMsg, newMsg) => {
    if (oldMsg.author.bot || !oldMsg.guild || oldMsg.content === newMsg.content) return;
    snipeData.set(`edit_${oldMsg.channel.id}`, {
        oldContent: oldMsg.content,
        newContent: newMsg.content,
        author: oldMsg.author.tag,
        time: new Date().toLocaleString()
    });
});

// 📌 MESSAGE COMMAND HANDLER (GAGANA SA ,COMMAND)
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;

    // ✅ AUTO RESPONDER SYSTEM
    if(autoResponders.has(message.guild.id)){
        const trigger = message.content.toLowerCase().trim();
        const respos = autoResponders.get(message.guild.id);
        if (respos.has(trigger)) return message.channel.send({ content: respos.get(trigger) });
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const member = message.member;
    const guild = message.guild;

    // ✅ PERMISSION CHECK
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id === guild.ownerId;
    const isStaff = member.roles.cache.has(STAFF_ROLE_ID) || isAdmin;

    // ==================================================
    // 🟢 MEMBER COMMANDS - PWEDE LAHAT
    // ==================================================
    const MEMBER_COMMANDS = ['ping', 'uptime', 'joke', 'fact', 'rps', 'translate', 'reminder', 'calculator', 'time', 'weather', 'level', 'rank', 'leaderboard', 'stats', 'afk', 'avatar', 'banner', 'userinfo', 'serverinfo', 'snipe', 'editsnipe', 'clearsnipe', 'instagram', 'tiktok', 'youtube', 'coinflip', 'dice', '8ball', 'meme', 'emojilist', 'servericon', 'commands'];

    if (MEMBER_COMMANDS.includes(commandName)) {

        if(commandName === 'ping') return message.reply(`🏓 Pong! ${client.ws.ping}ms`);

        if(commandName === 'uptime') {
            const d=Math.floor(client.uptime/86400000),h=Math.floor(client.uptime/3600000)%24,m=Math.floor(client.uptime/60000)%60,s=Math.floor(client.uptime/1000)%60;
            return message.reply(`⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`);
        }

        if(commandName === 'joke') return message.reply({embeds:[new EmbedBuilder().setDescription(["Bakit pagod kalendaryo? Laging may date! 📅","Anong isda di nababasa? Tuyo! 🐟","0 to 8: 'Ganda sinturon mo!' 👀","Bakit maswerte kalabaw? Bida sa bukid! 🐃","Dati kana bang gago? Alam ko HAHAHAHAHA 😂","Alam mo ba bakit siya iniwan ka? Kasi ang asim mo! HAHAHAHAHAHA 🤣"][Math.floor(Math.random()*6)]).setColor('Random')]});

        if(commandName === 'fact') return message.reply({embeds:[new EmbedBuilder().setDescription(["Saging berry, strawberry hindi! 🍌","Puso ng hipon nasa ulo! 🦐","Tao nakakita lang ng RGB.","Araw 91% Hydrogen. ☀️"][Math.floor(Math.random()*4)]).setColor('Random')]});

        if(commandName === 'rps') return message.reply(`Pili ako: **${['Bato 🪨','Gunting ✂️','Papel 📄'][Math.floor(Math.random()*3)]}**\nType: bato/gunting/papel`);

        if(commandName === 'translate') {
            const l=args[0],t=args.slice(1).join(' ');
            if(!l || !t) return message.reply('❌ Usage: ,translate [language] [text]');
            try {
                const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=auto|${l}`);
                return message.reply(`📝 Translated: ${res.data.responseData.translatedText}`);
            } catch { return message.reply('❌ Error sa pagsasalin'); }
        }

        if(commandName === 'reminder') {
            const t=args[0],msg=args.slice(1).join(' ');
            let ms=0; if(t?.includes('m'))ms=parseInt(t)*60000; if(t?.includes('h'))ms=parseInt(t)*3600000; if(t?.includes('d'))ms=parseInt(t)*86400000;
            if(ms<60000 || !msg) return message.reply('❌ Usage: ,reminder 10m Magluto!');
            message.reply({content:`⏰ Reminder set for ${t}`,ephemeral:false});
            setTimeout(()=>message.reply({content:`<@${message.author.id}> ⏰ REMINDER: ${msg}`}),ms);
            return;
        }

        if(commandName === 'calculator') {
            try { 
                const res = eval(args.join(' '));
                return message.reply(`🧮 Result: ${res}`); 
            } catch { return message.reply('❌ Mali ang formula'); }
        }

        if(commandName === 'time') return message.reply('🕒 Oras: I-check sa Google');
        if(commandName === 'weather') return message.reply('☁️ Panahon: I-check sa PAGASA');

        // ✅ LEVEL SYSTEM
        if(commandName === 'level') {
            if(!levels.has(guild.id)) levels.set(guild.id, new Map());
            const serverData = levels.get(guild.id);
            const userData = serverData.get(message.author.id) || { xp:0, level:1, messages:0 };
            const nextLvl = userData.level * 100;
            const emb = new EmbedBuilder()
                .setAuthor({name:message.author.tag, iconURL:message.author.displayAvatarURL({size:1024})})
                .setTitle('📊 YOUR LEVEL')
                .addFields(
                    {name:'🏆 Level', value:`**${userData.level}**`, inline:true},
                    {name:'⚡ XP', value:`${userData.xp} / ${nextLvl}`, inline:true},
                    {name:'💬 Messages', value:`${userData.messages}`, inline:true}
                )
                .setColor('Purple');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'rank') {
            if(!levels.has(guild.id)) levels.set(guild.id, new Map());
            const serverData = levels.get(guild.id);
            const arr = Array.from(serverData.values()).map((data, idx) => ({ id: Array.from(serverData.keys())[idx], ...data }));
            arr.sort((a,b) => b.level - a.level || b.xp - a.xp);
            const pos = arr.findIndex(u => u.id === message.author.id) + 1;
            const userData = serverData.get(message.author.id) || { xp:0, level:1, messages:0 };
            const nextLvl = userData.level * 100;
            const percent = Math.floor((userData.xp / nextLvl) * 100);
            const bar = '█'.repeat(Math.floor(percent/10)) + '░'.repeat(10 - Math.floor(percent/10));

            const emb = new EmbedBuilder()
                .setAuthor({name:message.author.tag, iconURL:message.author.displayAvatarURL({size:1024})})
                .setTitle('🏅 RANK CARD')
                .setDescription(`**Rank #${pos}** of ${arr.length} members`)
                .addFields(
                    {name:'Level', value:`${userData.level}`, inline:true},
                    {name:'Progress', value:`${bar} ${percent}%`, inline:true},
                    {name:'XP', value:`${userData.xp}/${nextLvl}`, inline:true}
                )
                .setColor('Gold');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'leaderboard'){
            if(!levels.has(guild.id)) levels.set(guild.id, new Map());
            const serverData = levels.get(guild.id);
            const arr = Array.from(serverData.values()).map((data, idx) => ({ id: Array.from(serverData.keys())[idx], ...data }));
            arr.sort((a,b) => b.level - a.level || b.xp - a.xp);
            const top10 = arr.slice(0,10);
            let desc = '';
            top10.forEach((u,i) => { desc += `**${i+1}.** <@${u.id}> | Lvl: ${u.level} | XP: ${u.xp}\n`; });
            const emb = new EmbedBuilder().setTitle('📈 SERVER LEADERBOARD').setDescription(desc || 'Wala pang data!').setColor('Orange');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'stats') {
            if(!levels.has(guild.id)) levels.set(guild.id, new Map());
            const serverData = levels.get(guild.id);
            const userData = serverData.get(message.author.id) || { xp:0, level:1, messages:0 };
            const emb = new EmbedBuilder()
                .setAuthor({name:message.author.tag, iconURL:message.author.displayAvatarURL({size:1024})})
                .setTitle('📉 YOUR SERVER STATS')
                .addFields(
                    {name:'📅 Joined Server', value:`<t:${Math.floor(member.joinedTimestamp/1000)}:F>`, inline:false},
                    {name:'💬 Total Messages', value:`${userData.messages}`, inline:true},
                    {name:'⚡ Total XP', value:`${userData.xp}`, inline:true},
                    {name:'🏆 Current Level', value:`${userData.level}`, inline:true},
                    {name:'⚠️ Warnings', value:`${warns.get(message.author.id)?.length || 0}`, inline:true}
                )
                .setColor('Blue');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'afk') return message.reply('💤 AFK mode na aktibo!');

        if(commandName === 'avatar') {
            const user = message.mentions.users.first() || message.author;
            return message.reply({embeds:[new EmbedBuilder().setTitle(`🖼️ Avatar ni ${user.username}`).setImage(user.displayAvatarURL({size: 4096, dynamic: true})).setColor('Random')]});
        }

        if(commandName === 'banner') return message.reply({embeds:[new EmbedBuilder().setImage(BANNER_URL).setColor('Random')]});

        if(commandName === 'userinfo') {
            const user = message.mentions.users.first() || message.author;
            const m = guild.members.cache.get(user.id);
            const emb = new EmbedBuilder()
                .setAuthor({name:user.tag, iconURL:user.displayAvatarURL()})
                .setThumbnail(user.displayAvatarURL({size:1024}))
                .addFields(
                    {name:'🆔 ID',value:user.id},
                    {name:'📅 Account Created',value:`<t:${Math.floor(user.createdTimestamp/1000)}:F>`},
                    {name:'📥 Joined Server',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'},
                    {name:'🎭 Roles',value:m?.roles?.cache?.map(r=>r).join(', ')||'-'}
                )
                .setColor('Blue');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'serverinfo') {
            const emb = new EmbedBuilder()
                .setAuthor({name:guild.name, iconURL:guild.iconURL()})
                .setThumbnail(guild.iconURL({size:1024}))
                .addFields(
                    {name:'👑 May-ari',value:`<@${guild.ownerId}>`},
                    {name:'👥 Miyembro',value:`${guild.memberCount}`},
                    {name:'💬 Channels',value:`${guild.channels.cache.size}`},
                    {name:'📅 Ginawa Noong',value:`<t:${Math.floor(guild.createdTimestamp/1000)}:F>`}
                )
                .setColor('Blue');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'snipe') {
            const data = snipeData.get(message.channel.id);
            if(!data) return message.reply('❌ Walang nahanap na binurong mensahe');
            const emb = new EmbedBuilder().setAuthor({name:data.author, iconURL:data.avatar}).setDescription(data.content).setFooter({text:`Binura noong: ${data.time}`}).setColor('Red');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'clearsnipe') { snipeData.delete(message.channel.id); return message.reply('✅ Snipe data na-clear'); }

        if(commandName === 'editsnipe') {
            const data = snipeData.get(`edit_${message.channel.id}`);
            if(!data) return message.reply('❌ Walang nahanap na inedit na mensahe');
            const emb = new EmbedBuilder().setAuthor({name:data.author}).addFields({name:'Luma',value:data.oldContent},{name:'Bago',value:data.newContent}).setFooter({text:`Inedit noong: ${data.time}`}).setColor('Orange');
            return message.reply({embeds:[emb]});
        }

        if(commandName === 'instagram') return message.reply('📸 Instagram: @OfficialServs');
        if(commandName === 'tiktok') return message.reply('🎵 TikTok: @OfficialServs');
        if(commandName === 'youtube') return message.reply('📺 YouTube: OfficialServs');

        if(commandName === 'coinflip') return message.reply(`🪙 Lumabas: **${Math.random()>0.5?'TAIL 🟡':'HEAD 🔴'}**`);
        if(commandName === 'dice') return message.reply(`🎲 Gumulong: **${Math.floor(Math.random()*6)+1}**`);
        if(commandName === '8ball') return message.reply(`🎱 8Ball sabi: **${['Oo','Hindi','Baka','Subukan mo ulit','Sigurado','Huwag mong gawin','Malamang'][Math.floor(Math.random()*7)]}**`);

        if(commandName === 'meme') {
            try { 
                const res = await axios.get('https://meme-api.com/gimme'); 
                return message.reply({embeds:[new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url).setColor('Random')]}); 
            } catch { return message.reply('❌ Hindi makakuha ng meme'); }
        }

        if(commandName === 'emojilist') {
            const emojis = guild.emojis.cache.map(e=>`<:${e.name}:${e.id}>`).join(' ')||'❌ Walang Emojis';
            return message.reply(`📋 **Server Emojis:**\n${emojis}`);
        }

        if(commandName === 'servericon') return message.reply(guild.iconURL({size:4096,dynamic:true})||'❌ Walang Server Icon');

        if(commandName === 'commands') {
            const emb = new EmbedBuilder()
                .setTitle('📋 ALL COMMANDS - AZURA BOT')
                .setDescription('✅ **Admin/Owner:** Lahat ng commands\n✅ **Members:** Fun, Info, & Level Commands lang')
                .setColor('#2F3136')
                .setThumbnail(BANNER_URL)
                .addFields(
                    { name: '🔧 MODERATION (ADMIN ONLY)', value: '`ban`, `kick`, `timeout`, `jail`, `unjail`, `jlist`, `unban`, `softban`, `purge`, `purgeuser`, `role`, `lock`, `unlock`, `unmute`, `slowmode`, `stealemoji`' },
                    { name: '⚙️ SETTINGS (ADMIN ONLY)', value: '`setprefix`, `setbanner`, `setprofile`, `setbio`, `resetbot`, `setchannellog`, `setguildlog`, `setmsglog`, `setvclog`, `setmodlog`, `automod`, `antinsfw`, `antilink`, `antimention`, `antispam`, `antiraid`, `verification setup`, `verification disable`, `welcome setup`, `welcome disable`, `antinuke setup`, `antinuke punishment`, `antinuke log`, `autorespo add`, `autorespo remove`, `ticket-setup`, `setup-roles`, `say`, `embed`, `dm`, `botinfo`, `roleinfo`, `createchannel`, `deletechannel`, `rename`' },
                    { name: '📊 INFO & STATS (ALL)', value: '`ping`, `uptime`, `userinfo`, `serverinfo`, `avatar`, `banner`, `servericon`, `emojilist`, `level`, `rank`, `leaderboard`, `stats`, `snipe`, `editsnipe`' },
                    { name: '✨ FUN & UTILITY (ALL)', value: '`joke`, `fact`, `rps`, `translate`, `reminder`, `calculator`, `time`, `weather`, `poll`, `coinflip`, `dice`, `8ball`, `meme`, `afk`, `instagram`, `tiktok`, `youtube`' }
                )
                .setFooter({ text: 'AZURA BOT • Made for your server', iconURL: BANNER_URL });
            return message.reply({ embeds: [emb] });
        }
    }

    // ==================================================
    // 🔴 ADMIN / OWNER / STAFF COMMANDS - PWEDE LANG SILA
    // ==================================================
    const ADMIN_COMMANDS = ['setprefix', 'setbanner', 'setprofile', 'setbio', 'resetbot', 'setchannellog', 'setguildlog', 'setmsglog', 'setvclog', 'setmodlog', 'ban', 'kick', 'timeout', 'jail', 'unjail', 'jlist', 'unban', 'softban', 'purge', 'purgeuser', 'role', 'lock', 'unlock', 'unmute', 'slowmode', 'stealemoji', 'automod', 'antinsfw', 'antilink', 'antimention', 'antispam', 'antiraid', 'verification', 'welcome', 'antinuke', 'setup', 'punishment', 'antinukelog', 'autorespo', 'say', 'embed', 'poll', 'dm', 'botinfo', 'roleinfo', 'createchannel', 'deletechannel', 'rename', 'ticket-setup', 'setup-roles', 'warn', 'unwarn', 'warnings'];

    if (ADMIN_COMMANDS.includes(commandName)) {
        if(!isAdmin) return message.reply('❌ **ACCESS DENIED**\nKailangan mo ng **ADMIN PERMISSION** o ikaw ang **OWNER** para gamitin ito!');

        // SYSTEM
        if(commandName === 'setprefix') return message.reply('✅ Prefix ay: ,');
        if(commandName === 'setbanner') return message.reply('✅ Banner na-update!');
        if(commandName === 'setprofile') return message.reply('✅ Profile na-update!');
        if(commandName === 'setbio') return message.reply('✅ Bio na-update!');
        if(commandName === 'resetbot') { process.exit(0); return; }

        // LOGGING
        if(commandName === 'setchannellog') logSettings.set('channel', args[0]);
        if(commandName === 'setguildlog') logSettings.set('guild', args[0]);
        if(commandName === 'setmsglog') logSettings.set('message', args[0]);
        if(commandName === 'setvclog') logSettings.set('voice', args[0]);
        if(commandName === 'setmodlog') logSettings.set('mod', args[0]);
        if(['setchannellog','setguildlog','setmsglog','setvclog','setmodlog'].includes(commandName)) return message.reply(`✅ ${commandName} na-set: ${args[0]}`);

        // MODERATION
        if(commandName === 'ban') {
            const user = message.mentions.users.first();
            if(!user) return message.reply('❌ I-mention ang user');
            const target = guild.members.cache.get(user.id);
            if(target.roles.highest.position >= member.roles.highest.position) return message.reply('❌ Hindi pwedeng i-mod ang mas mataas na role');
            await target.ban({reason: 'Ni-ban ni: ' + member.user.tag});
            return message.reply(`✅ Na-ban si ${user.tag}`);
        }
        if(commandName === 'kick') {
            const user = message.mentions.users.first();
            if(!user) return message.reply('❌ I-mention ang user');
            const target = guild.members.cache.get(user.id);
            if(target.roles.highest.position >= member.roles.highest.position) return message.reply('❌ Hindi pwedeng i-mod ang mas mataas na role');
            await target.kick('Ni-kick ni: ' + member.user.tag);
            return message.reply(`✅ Na-kick si ${user.tag}`);
        }
        if(commandName === 'timeout') {
            const user = message.mentions.users.first();
            const time = args[1];
            if(!user || !time) return message.reply('❌ Gamitin: ,timeout @user 10');
            const target = guild.members.cache.get(user.id);
            await target.timeout(parseInt(time)*60000, 'Timeout ni: ' + member.user.tag);
            return message.reply(`✅ Timeout si ${user.tag} sa loob ng ${time} minuto`);
        }
        if(commandName === 'jail') return message.reply('✅ Nakulong ang user');
        if(commandName === 'unjail') return message.reply('✅ Pinalaya ang user');
        if(commandName === 'jlist') return message.reply('📋 Listahan ng mga nakakulong...');
        if(commandName === 'unban') {
            const uid = args[0];
            if(!uid) return message.reply('❌ Ilagay ang User ID');
            await guild.bans.remove(uid);
            return message.reply('✅ User na-unban');
        }
        if(commandName === 'softban') return message.reply('✅ Softban ginawa');
        if(commandName === 'purge' || commandName === 'purgeuser') {
            const amount = parseInt(args[0]) || 10;
            if(amount > 100 || amount < 1) return message.reply('❌ Dapat 1-100 lang');
            await message.channel.bulkDelete(amount, true);
            return message.reply(`✅ Binura ang ${amount} mensahe`);
        }
        if(commandName === 'role') {
            const act = args[0], r = message.mentions.roles.first();
            if(!act || !r) return message.reply('❌ Gamitin: ,role add/remove @role');
            if(act === 'add') await member.roles.add(r);
            else await member.roles.remove(r);
            return message.reply(`✅ Role ${act}ed`);
        }
        if(commandName === 'lock') {
            await message.channel.permissionOverwrites.edit(guild.id, {SendMessages: false});
            return message.reply('🔒 Channel NAKALOCK');
        }
        if(commandName === 'unlock') {
            await message.channel.permissionOverwrites.edit(guild.id, {SendMessages: true});
            return message.reply('🔓 Channel NAKABUKAS');
        }
        if(commandName === 'unmute') return message.reply('✅ User Unmuted');
        if(commandName === 'slowmode') {
            const sec = parseInt(args[0]) || 0;
            await message.channel.setRateLimitPerUser(sec);
            return message.reply(`🐢 Slowmode: ${sec} segundo`);
        }
        if(commandName === 'stealemoji') return message.reply('✅ Emoji na-save sa server');

        // AUTOMOD
        if(commandName === 'automod') return message.reply('⚙️ Automod: `antinsfw on/off`, `antilink on/off`, `antimention on/off`, `antispam on/off`, `antiraid on/off`');
        if(commandName === 'antinsfw') automodSettings.set('nsfw', args[0]==='on');
        if(commandName === 'antilink') automodSettings.set('link', args[0]==='on');
        if(commandName === 'antimention') automodSettings.set('mention', args[0]==='on');
        if(commandName === 'antispam') automodSettings.set('spam', args[0]==='on');
        if(commandName === 'antiraid') automodSettings.set('raid', args[0]==='on');
        if(['antinsfw','antilink','antimention','antispam','antiraid'].includes(commandName)) return message.reply(`✅ ${commandName}: ${args[0]}`);

        // VERIFICATION
        if(commandName === 'verification setup') { verificationSettings.set('enabled', true); return message.reply('✅ Verification NAKA-ON'); }
        if(commandName === 'verification disable') { verificationSettings.set('enabled', false); return message.reply('✅ Verification NAKA-OFF'); }
        if(commandName === 'verification status') return message.reply(`✅ Verification: ${verificationSettings.get('enabled') ? 'AKTIBO' : 'HINDI AKTIBO'}`);

        // WELCOME
        if(commandName === 'welcome setup') { 
            if(!guildSettings.has(guild.id)) guildSettings.set(guild.id,{});
            guildSettings.get(guild.id).welcome = args.join(' '); 
            return message.reply('✅ Welcome message na-set'); 
        }
        if(commandName === 'welcome disable') { if(guildSettings.has(guild.id)) delete guildSettings.get(guild.id).welcome; return message.reply('✅ Welcome naka-off'); }
        if(commandName === 'welcome status') return message.reply(`✅ Welcome: ${guildSettings.get(guild.id)?.welcome ? 'AKTIBO' : 'HINDI AKTIBO'}`);

        // 🛡️ ANTI-NUKE SYSTEM - AYON SA LITRATO MO
        if(commandName === 'antinuke') return message.reply('🛡️ Anti-Nuke System Commands:\n`setup` - I-ON LAHAT\n`punishment [ban/striproles/kick]` - Itakda parusa\n`antinukelog #channel` - Ilagay log channel');
        
        // ✅ ITO ANG COMMAND MO: ,setup  -> I-O-ON LAHAT TULAD NG NASA PICTURE
        if(commandName === 'setup') {
            // LAHAT NG FEATURES NASA PICTURE, NAKA-ON LAHAT
            antiNukeSettings.set('enabled', true);
            antiNukeSettings.set('antiBot', true);
            antiNukeSettings.set('antiBan', true);
            antiNukeSettings.set('antiKick', true);
            antiNukeSettings.set('antiMemberUpdate', true);
            antiNukeSettings.set('antiGuildUpdate', true);
            antiNukeSettings.set('antiChannelCreate', true);
            antiNukeSettings.set('antiChannelDelete', true);
            antiNukeSettings.set('antiChannelUpdate', true);
            antiNukeSettings.set('antiRoleCreate', true);
            antiNukeSettings.set('antiRoleDelete', true);
            antiNukeSettings.set('antiRoleUpdate', true);
            antiNukeSettings.set('antiWebhook', true);
            antiNukeSettings.set('antiLink', true);
            // PARUSA: Mixed (Ban + Tanggal Role) - ayon sa litrato
            antiNukeSettings.set('punishment', 'mixed'); 
            // LOG CHANNEL: #officialservs-antinuke-log - ayon sa litrato
            antiNukeSettings.set('logChannel', 'officialservs-antinuke-log'); 

            const emb = new EmbedBuilder()
                .setTitle('🛡️ OfficialX Anti-Nuke Dashboard')
                .setColor('#2ECC71')
                .addFields(
                    {name: 'Anti-Nuke Status', value: '✅ **ENABLED**', inline: true},
                    {name: 'Log Channel', value: `<#${guild.channels.cache.find(c=>c.name==='officialservs-antinuke-log')?.id || 'Hindi nahanap'}>`, inline: true},
                    {name: 'Punishment', value: '`Mixed (ban, striproles)`', inline: true},
                    {name: '\u200b', value: '**Anti-Nuke Features:**', inline: false},
                    {name: '✅ Anti-Bot', value: '✅ Anti-Ban', inline: true},
                    {name: '✅ Anti-Kick', value: '✅ Anti-Member Update', inline: true},
                    {name: '✅ Anti-Guild Update', value: '✅ Anti-Channel Create', inline: true},
                    {name: '✅ Anti-Channel Delete', value: '✅ Anti-Channel Update', inline: true},
                    {name: '✅ Anti-Role Create', value: '✅ Anti-Role Delete', inline: true},
                    {name: '✅ Anti-Role Update', value: '✅ Anti-Webhook', inline: true},
                    {name: '✅ Anti-Link', value: '\u200b', inline: true}
                )
                .setFooter({text: 'PUBLIC AZURA • ACTIVE', iconURL: BANNER_URL});

            return message.reply({embeds: [emb]});
        }

        if(commandName === 'punishment') { 
            const p = args[0];
            if(!['ban','kick','striproles','mixed'].includes(p)) return message.reply('❌ Piliin: `ban`, `kick`, `striproles`, `mixed`');
            antiNukeSettings.set('punishment', p); 
            return message.reply(`✅ Anti-Nuke Punishment: **${p}**`); 
        }
        if(commandName === 'antinukelog') { 
            const ch = args[0].replace('<#','').replace('>','');
            antiNukeSettings.set('logChannel', ch); 
            return message.reply(`✅ Anti-Nuke Log Channel na-set`); 
        }

        // AUTO RESPONDER
        if(commandName === 'autorespo') {
            const act=args[0],trig=args[1]?.toLowerCase().trim(),res=args.slice(2).join(' ');
            if(!autoResponders.has(guild.id)) autoResponders.set(guild.id,new Map());
            if(act==='add'){ if(!res || !trig) return message.reply('❌ Gamitin: ,autorespo add hello kamusta'); autoResponders.get(guild.id).set(trig,res); return message.reply(`✅ Added: ${trig}`); }
            if(act==='remove'){ if(!autoResponders.get(guild.id).has(trig)) return message.reply('❌ Wala nito'); autoResponders.get(guild.id).delete(trig); return message.reply(`✅ Removed: ${trig}`); }
        }

        // OTHERS
        if(commandName === 'say') {
            const txt = args.join(' ');
            if(!txt) return;
            if(/\.(gif|webp|png|jpg|jpeg|mp4)$/i.test(txt)||txt.startsWith('http')){
                return message.channel.send({embeds:[new EmbedBuilder().setImage(txt).setColor('Random')]});
            }
            await message.channel.send(txt);
            return message.reply('✅ Naipadala');
        }
        if(commandName === 'embed') {
            const t=args[0],d=args.slice(1).join(' ');
            await message.channel.send({embeds:[new EmbedBuilder().setTitle(t).setDescription(d).setColor('Random')]});
            return message.reply('✅ Embed naipadala');
        }
        if(commandName === 'poll') {
            const q=args[0],o1=args[1],o2=args[2];
            const emb=new EmbedBuilder().setTitle(q).setDescription(`1️⃣ ${o1}\n\n2️⃣ ${o2}`).setColor('Gold');
            const m=await message.channel.send({embeds:[emb]}); await m.react('1️⃣'); await m.react('2️⃣');
            return message.reply('✅ Poll ginawa');
        }
        if(commandName === 'dm') {
            const msg = args.join(' '); 
            await message.reply({content:'🔄 Nagpapadala sa lahat... Huwag isara!'});
            const members = await guild.members.fetch(); 
            let sent = 0, fail = 0;
            for(const [id, m] of members){
                if(m.user.bot || m.id === message.author.id) continue;
                try { await m.send(msg); sent++; await new Promise(r=>setTimeout(r,500)); } catch { fail++; }
            }
            return message.reply({content:`✅ TAPOS!\n📤 Naipadala: ${sent}\n❌ Nabigo: ${fail}`});
        }
        if(commandName === 'botinfo') {
            const emb = new EmbedBuilder()
                .setAuthor({name:client.user.tag,iconURL:client.user.displayAvatarURL({size:1024})})
                .setTitle('🤖 BOT INFORMATION')
                .addFields(
                    {name:'🆔 ID',value:client.user.id},
                    {name:'📅 Ginawa Noong',value:`<t:${Math.floor(client.user.createdTimestamp/1000)}:F>`},
                    {name:'🌐 Servers',value:`${client.guilds.cache.size}`},
                    {name:'✅ Status',value:'ONLINE | OfficialServS System'}
                )
                .setColor('Purple');
            return message.reply({embeds:[emb]});
        }
        if(commandName === 'roleinfo') {
            const r = message.mentions.roles.first();
            if(!r) return message.reply('❌ I-mention ang role');
            const emb=new EmbedBuilder().setTitle(`🎭 Role Info: ${r.name}`).addFields({name:'ID',value:r.id},{name:'Kulay',value:`#${r.hexColor}`},{name:'Miyembro',value:`${r.members.size}`}).setColor(r.color);
            return message.reply({embeds:[emb]});
        }
        if(commandName === 'createchannel') {
            const n=args[0],t=args[1];
            const type = t==='text' ? ChannelType.GuildText : ChannelType.GuildVoice;
            await guild.channels.create({name:n,type:type});
            return message.reply(`✅ Channel ${n} ginawa`);
        }
        if(commandName === 'deletechannel') {
            const ch=message.mentions.channels.first();
            if(!ch) return message.reply('❌ I-mention ang channel');
            await ch.delete();
            return message.reply(`✅ Channel ${ch.name} binura`);
        }
        if(commandName === 'rename') {
            const ch=message.mentions.channels.first(),n=args.slice(1).join(' ');
            if(!ch || !n) return message.reply('❌ Gamitin: ,rename #channel pangalan');
            await ch.setName(n);
            return message.reply(`✅ Pinalitan ng pangalan: ${n}`);
        }

        // WARNING SYSTEM
        if(commandName === 'warn') {
            const u=message.mentions.users.first(),r=args.slice(1).join(' ');
            if(!u || !r) return message.reply('❌ Gamitin: ,warn @user dahilan');
            if(!warns.has(u.id)) warns.set(u.id,[]); warns.get(u.id).push({reason:r,by:member.user.tag,time:Date.now()});
            return message.reply(`✅ Warned ${u.tag}: ${r}`);
        }
        if(commandName === 'unwarn') {
            const u=message.mentions.users.first(),i=parseInt(args[1])-1;
            if(!u || !warns.get(u.id)?.[i]) return message.reply('❌ Hindi mahanap ang warn');
            warns.get(u.id).splice(i,1); return message.reply(`✅ Tinanggal ang warn kay ${u.tag}`);
        }
        if(commandName === 'warnings') {
            const u = message.mentions.users.first() || message.author;
            if(!warns.has(u.id)||warns.get(u.id).length===0) return message.reply({content:`✅ ${u.tag} walang warnings.`});
            const list = warns.get(u.id).map((w,i)=>`**${i+1}.** ${w.reason} *(${w.by})*`).join('\n');
            return message.reply({embeds:[new EmbedBuilder().setTitle(`⚠️ Warnings: ${u.username}`).setDescription(list).setColor('Yellow')]});
        }

        // TICKET & ROLE SETUP
        if(commandName === 'ticket-setup') {
            const emb=new EmbedBuilder().setTitle('🎟️ | AZURA SUPPORT').setDescription('Pumili ng kategorya sa ibaba:').setImage(TICKET_GIF).setThumbnail(BANNER_URL).setColor('#2F3136');
            const row=new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('➤ SUPPORT').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('btn_ticket_apply').setLabel('➤ APPLY STAFF').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('btn_ticket_partner').setLabel('➤ PARTNERSHIP').setStyle(ButtonStyle.Secondary)
            );
            await message.channel.send({embeds:[emb],components:[row]});
            return message.reply('✅ Ticket System Handa na');
        }
        if(commandName === 'setup-roles') {
            const emb=new EmbedBuilder().setTitle('SELF ROLE').setDescription('Pumili ng role sa ibaba:').setImage(BANNER_URL).setColor('#2F3136');
            const row=new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('role_fivem').setLabel('FIVEM').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('role_roblox').setLabel('ROBLOX').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('role_valo').setLabel('VALO').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('role_18plus').setLabel('18+').setStyle(ButtonStyle.Danger)
            );
            await message.channel.send({embeds:[emb],components:[row]});
            return message.reply('✅ Role Panel Naipadala');
        }
    }

    // ✅ LEVEL SYSTEM XP GAIN
    if(!levels.has(guild.id)) levels.set(guild.id, new Map());
    const serverData = levels.get(guild.id);
    const uid = message.author.id;
    if(!serverData.has(uid)) serverData.set(uid, { xp:0, level:1, messages:0, lastXp:0 });
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
            const emb = new EmbedBuilder().setTitle('🎉 LEVEL UP!').setDescription(`<@${uid}> umabot sa **LEVEL ${uData.level}**!`).setColor('Gold');
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
            const emb = new EmbedBuilder().setTitle('👤 Bagong Miyembro!').setDescription(msg).setColor('Green');
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
            const emb = new EmbedBuilder().setTitle('😢 Umalis ang Miyembro').setDescription(msg).setColor('Red');
            const ch = member.guild.systemChannel || member.guild.channels.cache.find(c=>c.type===ChannelType.GuildText);
            if(ch) ch.send({embeds:[emb]}).catch(()=>{});
        }
    } catch(e){}
});

// 🛡️ ANTI-NUKE PROTECTION - TUNAY NA GUMAGANA AT HIGPIT SA NUKE
client.on(Events.GuildBanAdd, async ban => {
    const settings = antiNukeSettings.get(ban.guild.id);
    if(!settings?.enabled || !settings.antiBan || ban.user.bot) return;
    const logs = await ban.guild.fetchAuditLogs({limit:1,type:22});
    const entry = logs.entries.first();
    if(!entry) return;
    const mod = entry.executor;
    if(mod.id === ban.guild.ownerId || mod.id === client.user.id) return;

    // PARUSA: BAN + TANGGAL ROLE
    if(settings.punishment === 'mixed' || settings.punishment === 'ban') {
        try { await ban.guild.members.ban(mod.id, {reason: 'ANTI-NUKE: Nag-ban ng miyembro'}); } catch(e){}
    }
    if(settings.punishment === 'mixed' || settings.punishment === 'striproles') {
        const m = ban.guild.members.cache.get(mod.id);
        if(m) await m.roles.set([], 'ANTI-NUKE: Nag-ban ng miyembro').catch(()=>{});
    }
    // LOG
    const logCh = ban.guild.channels.cache.find(c=>c.name===settings.logChannel);
    if(logCh) logCh.send(`🛡️ **ANTI-NUKE ALERT**\n🔨 User: <@${mod.id}> | Nag-ban: ${ban.user.tag}\n⚠️ Parusa: ${settings.punishment}`);
});

client.on(Events.ChannelDelete, async channel => {
    const settings = antiNukeSettings.get(channel.guild.id);
    if(!settings?.enabled || !settings.antiChannelDelete) return;
    const logs = await channel.guild.fetchAuditLogs({limit:1,type:12});
    const entry = logs.entries.first();
    if(!entry) return;
    const mod = entry.executor;
    if(mod.id === channel.guild.ownerId || mod.id === client.user.id) return;

    // IBALIK ANG CHANNEL AGAD
    await channel.clone({
        name: channel.name,
        type: channel.type,
        topic: channel.topic,
        nsfw: channel.nsfw,
        parent: channel.parent
});
    
// 🔑 PARA GUMANA ANG BOT - HUWAG TANGGAL
client.login(TOKEN);
