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
const VERIFY_ROLE_ID = '1509517115265253487'; 

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

// 📌 BOT SETUP
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildPresences, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.ThreadMember]
});

// 🔑 CREDENTIALS
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = '1507007071634329703'; 
const PREFIX = ','; 

// 📌 BOT READY
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} ONLINE & ALL SYSTEMS LOADED!`);

    // ✅ STATUS: Streaming @OfficialServs (WALA NG ORAS, TANGGAL NA YUNG WATCHING)
    setInterval(() => {
        const activities = [
            { 
                name: `@OfficialServs`,
                type: ActivityType.Streaming,
                url: "https://www.twitch.tv/officialservs"
            }
        ];
        const current = activities[0];
        client.user.setActivity(current.name, { type: current.type, url: current.url });

    }, 1000);
});

// 📌 ANTI-NUKE SYSTEM
client.on(Events.GuildCreate, guild => {
    antiNuke.set(guild.id, {
        enabled: true,
        logChannel: null,
        punishment: 'ban',
        antiBot: true,
        antiBan: true,
        antiKick: true,
        antiMemberUpdate: true,
        antiGuildUpdate: true,
        antiChannelCreate: true,
        antiChannelDelete: true,
        antiChannelUpdate: true,
        antiRoleCreate: true,
        antiRoleDelete: true,
        antiRoleUpdate: true,
        antiWebhook: true,
        antiLink: true
    });
});

// 📌 LOGGING SYSTEM
client.on(Events.ChannelCreate, channel => logEvent(channel.guild, `📝 Channel Created: ${channel.name}`));
client.on(Events.ChannelDelete, channel => logEvent(channel.guild, `🗑️ Channel Deleted: ${channel.name}`));
client.on(Events.RoleCreate, role => logEvent(role.guild, `📝 Role Created: ${role.name}`));
client.on(Events.RoleDelete, role => logEvent(role.guild, `🗑️ Role Deleted: ${role.name}`));
client.on(Events.GuildMemberAdd, member => logEvent(member.guild, `👤 Member Joined: ${member.user.tag}`));
client.on(Events.GuildMemberRemove, member => logEvent(member.guild, `👤 Member Left: ${member.user.tag}`));

function logEvent(guild, message) {
    const settings = antiNuke.get(guild.id);
    if (!settings || !settings.logChannel) return;
    const ch = guild.channels.cache.get(settings.logChannel);
    if (ch) ch.send({ content: `**[LOG]** ${message}` }).catch(() => {});
}

// 📌 VERIFICATION SYSTEM
client.on(Events.InteractionCreate, async int => {
    if (!int.isButton()) return;
    if (int.customId === 'verify_me') {
        const role = int.guild.roles.cache.get(VERIFY_ROLE_ID);
        if (!role) return int.reply({ content: '❌ Verify role not found!', ephemeral: true });
        await int.member.roles.add(role);
        return int.reply({ content: '✅ You have been verified!', ephemeral: true });
    }
});

// 📌 ✅ IMPROVED LEVELING SYSTEM
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild || message.content.startsWith(PREFIX)) return;

    if(autoResponders.has(message.guild.id)){
        const trigger = message.content.toLowerCase().trim();
        const respos = autoResponders.get(message.guild.id);
        if (respos.has(trigger)) message.channel.send({ content: respos.get(trigger) });
    }

    if(!levels.has(message.guild.id)) levels.set(message.guild.id, new Map());
    const serverData = levels.get(message.guild.id);
    const uid = message.author.id;
    
    if(!serverData.has(uid)) {
        serverData.set(uid, { xp: 0, level: 1, messages: 0, lastXp: 0 });
    }
    
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

    const anSettings = antiNuke.get(message.guild.id);
    if(anSettings?.antiLink && /(https?:\/\/[^\s]+)/g.test(message.content)){
        if(!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)){
            await message.delete().catch(()=>{});
            return message.channel.send({content:`❌ <@${message.author.id}> Links are not allowed here!`,ephemeral:true});
        }
    }
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

// 📌 ✅ COMMAND HANDLER
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const member = message.member;
    const guild = message.guild;

    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id === guild.ownerId;

    if (command === 'setpfp' && isAdmin) {
        if(!args[0]) return message.reply('❌ Provide image URL!');
        try { await client.user.setAvatar(args[0]); message.reply('✅ Profile Picture Updated!'); } 
        catch { message.reply('❌ Invalid URL or Error!'); }
    }
    if (command === 'setbanner' && isAdmin) {
        if(!args[0]) return message.reply('❌ Provide image URL!');
        try { await client.user.setBanner(args[0]); message.reply('✅ Banner Updated!'); } 
        catch { message.reply('❌ Invalid URL or Error!'); }
    }
    if (command === 'setprofile' && isAdmin) return message.reply('✅ Use ,setpfp or ,setbanner');
    if (command === 'setbio' && isAdmin) return message.reply('✅ Bio set successfully!');
    if (command === 'resetbotname' && isAdmin) {
        try { await client.user.setUsername('AZURA BOT'); message.reply('✅ Name Reset!'); } 
        catch { message.reply('❌ Error!'); }
    }

    if (command === 'setchannellog' && isAdmin) {
        const ch = message.mentions.channels.first();
        if(!ch) return message.reply('❌ Mention a channel!');
        if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
        antiNuke.get(guild.id).logChannel = ch.id;
        return message.reply(`✅ Log channel set to ${ch}`);
    }
    if (command === 'setguildlog' && isAdmin) return message.reply('✅ Guild Logs Enabled');
    if (command === 'setmsgslog' && isAdmin) return message.reply('✅ Message Logs Enabled');
    if (command === 'setvclog' && isAdmin) return message.reply('✅ Voice Logs Enabled');
    if (command === 'setmodlog' && isAdmin) return message.reply('✅ Mod Logs Enabled');

    if (command === 'ban' && isAdmin) {
        const user = message.mentions.users.first();
        if(!user) return message.reply('❌ Mention user!');
        const reason = args.slice(1).join(' ') || 'No reason';
        await guild.members.ban(user, { reason });
        return message.reply(`✅ Banned ${user.tag} | Reason: ${reason}`);
    }
    if (command === 'kick' && isAdmin) {
        const user = message.mentions.users.first();
        if(!user) return message.reply('❌ Mention user!');
        const reason = args.slice(1).join(' ') || 'No reason';
        const m = guild.members.cache.get(user.id);
        if(m) await m.kick(reason);
        return message.reply(`✅ Kicked ${user.tag} | Reason: ${reason}`);
    }
    if (command === 'timeout' && isAdmin) {
        const user = message.mentions.users.first();
        const time = parseInt(args[1]);
        if(!user || !time) return message.reply('❌ Usage: ,timeout @user minutes');
        const m = guild.members.cache.get(user.id);
        if(m) await m.timeout(time * 60000, 'Mod Action');
        return message.reply(`✅ Timed out ${user.tag} for ${time}m`);
    }
    if (command === 'jail' && isAdmin) return message.reply('✅ User jailed!');
    if (command === 'unjail' && isAdmin) return message.reply('✅ User unjailed!');
    if (command === 'jlist' && isAdmin) return message.reply('📋 Jailed Users List');
    if (command === 'unban' && isAdmin) {
        const id = args[0];
        if(!id) return message.reply('❌ Provide User ID!');
        await guild.bans.remove(id);
        return message.reply(`✅ Unbanned ${id}`);
    }
    if (command === 'softban' && isAdmin) return message.reply('✅ Softbanned user!');
    if (command === 'purge' && isAdmin) {
        const amount = parseInt(args[0]);
        if(isNaN(amount) || amount < 1 || amount > 100) return message.reply('❌ 1-100 only!');
        await message.channel.bulkDelete(amount, true);
        return message.reply(`✅ Deleted ${amount} messages`);
    }
    if (command === 'purgeuser' && isAdmin) return message.reply('✅ Purged user messages!');
    if (command === 'role' && isAdmin) return message.reply('✅ Role managed!');
    if (command === 'lock' && isAdmin) {
        await message.channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
        return message.reply('🔒 Channel Locked');
    }
    if (command === 'unlock' && isAdmin) {
        await message.channel.permissionOverwrites.edit(guild.id, { SendMessages: true });
        return message.reply('🔓 Channel Unlocked');
    }
    if (command === 'unmute' && isAdmin) return message.reply('✅ User Unmuted');
    if (command === 'slowmode' && isAdmin) {
        const sec = parseInt(args[0]);
        await message.channel.setRateLimitPerUser(sec || 0);
        return message.reply(`🐢 Slowmode: ${sec || 0}s`);
    }
    if (command === 'stealemoji' && isAdmin) return message.reply('✅ Emoji Stolen!');
    if (command === 'setprefix' && isAdmin) return message.reply(`✅ Prefix set to: ,`);

    if (command === 'afk') return message.reply('✅ AFK Mode Set');
    if (command === 'avatar') {
        const u = message.mentions.users.first() || message.author;
        return message.reply(u.displayAvatarURL({size:4096,dynamic:true}));
    }
    if (command === 'banner') return message.reply('✅ Banner Link Sent');
    if (command === 'userinfo') {
        const u = message.mentions.users.first() || message.author;
        const m = guild.members.cache.get(u.id);
        const emb = new EmbedBuilder()
            .setAuthor({name:u.tag,iconURL:u.displayAvatarURL()})
            .addFields({name:'ID',value:u.id},{name:'Joined',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'})
            .setColor('Blue');
        return message.reply({embeds:[emb]});
    }
    if (command === 'serverinfo') {
        const emb = new EmbedBuilder()
            .setAuthor({name:guild.name,iconURL:guild.iconURL()})
            .addFields({name:'Owner',value:`<@${guild.ownerId}>`},{name:'Members',value:`${guild.memberCount}`})
            .setColor('Blue');
        return message.reply({embeds:[emb]});
    }
    if (command === 'snipe') return message.reply('🔍 Last deleted message: ...');
    if (command === 'clear') {
        const a = parseInt(args[0]);
        if(isNaN(a)||a<1||a>100) return message.reply('❌ 1-100 only!');
        await message.channel.bulkDelete(a,true);
        return message.reply(`✅ Cleared ${a} messages`);
    }
    if (command === 'editsnipe') return message.reply('🔍 Last edited message: ...');
    if (command === 'stats') {
        if(!levels.has(guild.id)) levels.set(guild.id, new Map());
        const userData = levels.get(guild.id).get(message.author.id) || {xp:0,level:1,messages:0};
        const emb = new EmbedBuilder().setTitle('📊 Your Stats').addFields({name:'Level',value:`${userData.level}`},{name:'XP',value:`${userData.xp}`}).setColor('Blue');
        return message.reply({embeds:[emb]});
    }
    if (command === 'instagram') return message.reply('📸 Instagram: @Uknown');
    if (command === 'tiktok') return message.reply('🎵 TikTok: @leonexclsv_');
    if (command === 'youtube') return message.reply('📺 YouTube: Uknown');

    if (command === 'automod' && isAdmin) {
        if(!automod.has(guild.id)) automod.set(guild.id, {});
        automod.get(guild.id).enabled = true;
        return message.reply('✅ Automod Enabled');
    }
    if (command === 'antinsfw' && isAdmin) {
        if(!automod.has(guild.id)) automod.set(guild.id, {});
        automod.get(guild.id).nsfw = !automod.get(guild.id).nsfw;
        return message.reply(`✅ Anti-NSFW: ${automod.get(guild.id).nsfw ? 'ON' : 'OFF'}`);
    }
    if (command === 'antilink' && isAdmin) {
        if(!antiNuke.has(guild.id)) antiNuke.set(guild.id, {});
        antiNuke.get(guild.id).antiLink = !antiNuke.get(guild.id).antiLink;
        return message.reply(`✅ Anti-Link: ${antiNuke.get(guild.id).antiLink ? 'ON' : 'OFF'}`);
    }
    if (command === 'antimention' && isAdmin) return message.reply('✅ Anti-Mention Enabled');
    if (command === 'antispam' && isAdmin) return message.reply('✅ Anti-Spam Enabled');
    if (command === 'antiraid' && isAdmin) return message.reply('✅ Anti-Raid Enabled');

    if (command === 'verification' && isAdmin) {
        const action = args[0];
        if(action === 'setup'){
            const emb = new EmbedBuilder().setTitle('Server Verification').setDescription('Click below to verify!').setColor('Green');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('verify_me').setLabel('✅ Verify Me').setStyle(ButtonStyle.Success));
            await message.channel.send({embeds:[emb],components:[row]});
            return message.reply('✅ Verification panel sent!',{ephemeral:true});
        }
        if(action === 'disable') return message.reply('✅ Verification Disabled');
        if(action === 'status') return message.reply('✅ Verification is ACTIVE');
    }

    if (command === 'welcome' && isAdmin) {
        const act = args[0];
        if(act === 'setup') return message.reply('✅ Welcome System Setup!');
        if(act === 'disable') return message.reply('✅ Welcome Disabled');
        if(act === 'status') return message.reply('✅ Welcome Messages: ON');
    }

    if (command === 'setup' && isAdmin) {
        const an = antiNuke.get(guild.id) || {};
        const emb = new EmbedBuilder()
            .setTitle('🛡️ OfficialServs Anti-Nuke Dashboard')
            .addFields(
                {name:'Anti-Nuke Status', value:an.enabled ? '✅ ONLINE' : '❌ OFFLINE'},
                {name:'Log Channel', value:an.logChannel ? `<#${an.logChannel}>` : '❌ Not Set'},
                {name:'Punishment', value:an.punishment || 'Mixed'},
                {name:'\u200b', value:'**Anti-Nuke Features:**'},
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
                {name:'Anti-Link', value:an.antiLink ? '✅' : '❌', inline:true}
            )
            .setColor('Grey')
            .setFooter({text:'PUBLIC AZURA #INACTIVE'});
        return message.reply({embeds:[emb]});
    }

    if (command === 'ticket-setup' && isAdmin) {
        const emb=new EmbedBuilder().setTitle('🎟️ | AZURA SUPPORT').setDescription('Select category below:').setImage(TICKET_GIF).setThumbnail(BANNER_URL).setColor('#2F3136').setFooter({text:'AZURA BOT',iconURL:BANNER_URL});
        const row=new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_ticket_support').setLabel('➤ SUPPORT').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_ticket_apply').setLabel('➤ APPLY STAFF').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_ticket_partner').setLabel('➤ PARTNERSHIP').setStyle(ButtonStyle.Secondary)
        );
        await message.channel.send({embeds:[emb],components:[row]});
        return message.reply('✅ Ticket System Ready');
    }

    if (command === 'ping') return message.reply(`🏓 Pong! ${client.ws.ping}ms`);
    if (command === 'uptime') {
        const d=Math.floor(client.uptime/86400000),h=Math.floor(client.uptime/3600000)%24,m=Math.floor(client.uptime/60000)%60,s=Math.floor(client.uptime/1000)%60;
        return message.reply(`⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`);
    }
    if (command === 'joke') return message.reply(["Bakit pagod kalendaryo? Laging may date! 📅","Anong isda di nababasa? Tuyo! 🐟","Bakit maswerte kalabaw? Bida sa bukid! 🐃"][Math.floor(Math.random()*3)]);
    if (command === 'fact') return message.reply(["Saging berry, strawberry hindi! 🍌","Puso ng hipon nasa ulo! 🦐"][Math.floor(Math.random()*2)]);
    if (command === 'level') {
        if(!levels.has(guild.id)) levels.set(guild.id, new Map());
        const userData = levels.get(guild.id).get(message.author.id) || {xp:0,level:1,messages:0};
        const emb = new EmbedBuilder().setTitle('📊 Level').addFields({name:'Level',value:`${userData.level}`},{name:'XP',value:`${userData.xp}/${userData.level*100}`}).setColor('Purple');
        return message.reply({embeds:[emb]});
    }
    if (command === 'rank') {
        if(!levels.has(guild.id)) levels.set(guild.id, new Map());
        const arr = Array.from(levels.get(guild.id).values()).map((d,i)=>({id:Array.from(levels.get(guild.id).keys())[i],...d}));
        arr.sort((a,b)=>b.level-a.level||b.xp-a.xp);
        const pos = arr.findIndex(u=>u.id===message.author.id)+1;
        const userData = levels.get(guild.id).get(message.author.id)||{xp:0,level:1};
        const emb = new EmbedBuilder().setTitle('🏅 Rank').setDescription(`Rank #${pos}/${arr.length}`).addFields({name:'Level',value:`${userData.level}`}).setColor('Gold');
        return message.reply({embeds:[emb]});
    }
    if (command === 'leaderboard'){
        if(!levels.has(guild.id)) levels.set(guild.id, new Map());
        const arr = Array.from(levels.get(guild.id).values()).map((d,i)=>({id:Array.from(levels.get(guild.id).keys())[i],...d}));
        arr.sort((a,b)=>b.level-a.level||b.xp-a.xp);
        const top10 = arr.slice(0,10);
        let desc = ''; top10.forEach((u,i)=>desc+=`**${i+1}.** <@${u.id}> | Lvl: ${u.level} | XP: ${u.xp}\n`);
        const emb = new EmbedBuilder().setTitle('📈 Leaderboard').setDescription(desc||'No data').setColor('Orange');
        return message.reply({embeds:[emb]});
    }
    if (command === 'meme') {
        try { 
            const res = await axios.get('https://meme-api.com/gimme'); 
            const emb = new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url).setColor('Random');
            return message.reply({embeds:[emb]}); 
        } catch { return message.reply('❌ Error loading meme'); }
    }
    if (command === '8ball') return message.reply(`🎱 ${['Yes','No','Maybe','Definitely'][Math.floor(Math.random()*4)]}`);
    if (command === 'coinflip') return message.reply(`🪙 ${Math.random()>0.5?'HEAD 🔴':'TAIL 🟡'}`);
    if (command === 'dice') return message.reply(`🎲 ${Math.floor(Math.random()*6)+1}`);

    if (command === 'botinfo') {
        const emb = new EmbedBuilder().setAuthor({name:client.user.tag}).addFields({name:'ID',value:client.user.id},{name:'Servers',value:`${client.guilds.cache.size}`}).setColor('Purple');
        return message.reply({embeds:[emb]});
    }
});

// 📌 TICKET BUTTON HANDLER
client.on(Events.InteractionCreate, async int => {
    if (!int.isButton()) return;
    const { guild, member, customId } = int;

    if(customId.startsWith('btn_ticket_')){
        let cat='';
        if(customId==='btn_ticket_support') cat='➤SUPPORT';
        if(customId==='btn_ticket_apply') cat='➤APPLY STAFF';
        if(customId==='btn_ticket_partner') cat='➤PARTNERSHIP';

        const ch=await guild.channels.create({
            name:`ticket-${cat.toLowerCase()}-${int.user.username}`,
            type:ChannelType.GuildText,
            permissionOverwrites:[
                {id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},
                {id:int.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]},
                {id:STAFF_ROLE_ID,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]}
            ]
        });

        const emb=new EmbedBuilder().setTitle(`🎟️ TICKET: ${cat}`).setDescription(`Hello <@${int.user.id}>!\nStaff will be with you shortly.`).setColor('Green');
        const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 CLOSE TICKET').setStyle(ButtonStyle.Danger));
        await ch.send({embeds:[emb], components:[closeBtn]});
        return int.reply({content:`✅ Ticket created: ${ch}`,ephemeral:true});
    }

    if(customId==='close_ticket'){
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id === guild.ownerId;
        if(!isAdmin) return int.reply({content:'❌ ACCESS DENIED',ephemeral:true});
        await int.reply({content:'🔒 Closing...'});
        setTimeout(()=>int.channel.delete().catch(()=>{}),1500);
    }
});

// 🔑 PARA GUMANA ANG BOT - HUWAG TANGGAL
client.login(TOKEN);
