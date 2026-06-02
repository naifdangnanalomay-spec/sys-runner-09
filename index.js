const {
    Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, REST, Routes,
    Partials, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, Events
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

// 📌 SLASH COMMANDS (NAKALAHAT NA DITO, KASAMA DM!)
const commands = [
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
    { name: 'warnings', description: 'Check your warnings or others', options: [{name:'user',type:6,description:'User',required:false}]},
    { name: 'joke', description: 'Get a random joke' },
    { name: 'fact', description: 'Get a random fact' },
    { name: 'rps', description: 'Play Rock Paper Scissors with bot' },
    { name: 'translate', description: 'Translate text', options: [{name:'language',type:3,required:true},{name:'text',type:3,required:true}]},
    { name: 'reminder', description: 'Set reminder', options: [{name:'time',type:3,required:true},{name:'message',type:3,required:true}]},
    { name: 'calculator', description: 'Math calculate', options: [{name:'expression',type:3,required:true}]},
    { name: 'time', description: 'Get time', options: [{name:'location',type:3,required:true}]},
    { name: 'weather', description: 'Get weather', options: [{name:'location',type:3,required:true}]},
    { name: 'slowmode', description: 'Set slowmode', options: [{name:'seconds',type:4,required:true}]},
    { name: 'addrole', description: 'Add role', options: [{name:'user',type:6,required:true},{name:'role',type:8,required:true}]},
    { name: 'removerole', description: 'Remove role', options: [{name:'user',type:6,required:true},{name:'role',type:8,required:true}]},
    { name: 'lockdown', description: 'Lock all channels' },
    { name: 'ticket', description: 'Ticket manage', options: [{name:'action',type:3,required:true,choices:[{name:'add',value:'add'},{name:'remove',value:'remove'},{name:'transcript',value:'transcript'}]},{name:'user',type:6,required:false}]},
    { name: 'welcome', description: 'Set welcome msg', options: [{name:'set',type:3,required:true}]},
    { name: 'leave', description: 'Set leave msg', options: [{name:'set',type:3,required:true}]},
    { name: 'level', description: 'Check level' },
    { name: 'rank', description: 'Show rank' },
    { name: 'leaderboard', description: 'Top members' },
    { name: 'stats', description: 'User stats' },
    { name: 'say', description: 'Bot say', options: [{name:'message',type:3,required:true}]},
    { name: 'autorespo', description: 'Auto responder', options: [{name:'action',type:3,required:true,choices:[{name:'Add',value:'add'},{name:'Remove',value:'remove'}]},{name:'trigger',type:3,required:true},{name:'response',type:3,required:false}]},
    { name: 'embed', description: 'Make embed', options: [{name:'title',type:3,required:true},{name:'description',type:3,required:true},{name:'color',type:3,required:false}]},
    { name: 'clear', description: 'Delete messages', options: [{name:'amount',type:4,required:true}]},
    { name: 'kick', description: 'Kick user', options: [{name:'user',type:6,required:true}]},
    { name: 'ban', description: 'Ban user', options: [{name:'user',type:6,required:true}]},
    { name: 'unban', description: 'Unban user', options: [{name:'userid',type:3,required:true}]},
    { name: 'warn', description: 'Warn user', options: [{name:'user',type:6,required:true},{name:'reason',type:3,required:true}]},
    { name: 'unwarn', description: 'Remove warn', options: [{name:'user',type:6,required:true},{name:'index',type:4,required:true}]},
    { name: 'poll', description: 'Make poll', options: [{name:'question',type:3,required:true},{name:'option1',type:3,required:true},{name:'option2',type:3,required:true}]},
    { name: 'timeout', description: 'Timeout user', options: [{name:'user',type:6,required:true},{name:'minutes',type:4,required:true}]},
    { name: 'lock', description: 'Lock channel' },
    { name: 'unlock', description: 'Unlock channel' },
    { name: 'userinfo', description: 'User info', options: [{name:'user',type:6,required:false}]},
    { name: 'serverinfo', description: 'Server info' },
    { name: 'avatar', description: 'Get avatar', options: [{name:'user',type:6,required:false}]},
    { name: 'coinflip', description: 'Flip coin' },
    { name: 'dice', description: 'Roll dice' },
    { name: '8ball', description: 'Magic 8ball', options: [{name:'question',type:3,required:true}]},
    { name: 'meme', description: 'Random meme' },
    { name: 'dm', description: '📩 DM ALL MEMBERS (ADMIN ONLY)', options: [{name:'message',type:3,description:'Message to send to everyone',required:true}]}
];

// 📌 BOT READY
client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Re-registering commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✅ ${client.user.tag} ONLINE & ALL COMMANDS LOADED!`);
    } catch (err) { console.error('❌ Error:', err); }
});

// 📌 AUTO RESPONSE + LEVEL SYSTEM
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // Auto Response
    if(autoResponders.has(message.guild.id)){
        const trigger = message.content.toLowerCase().trim();
        const respos = autoResponders.get(message.guild.id);
        if (respos.has(trigger)) message.channel.send({ content: respos.get(trigger) });
    }

    // Leveling
    if(!levels.has(message.guild.id)) levels.set(message.guild.id, new Map());
    const serverData = levels.get(message.guild.id);
    const uid = message.author.id;
    if(!serverData.has(uid)) serverData.set(uid, { xp:0, level:0, messages:0 });
    const uData = serverData.get(uid);
    uData.messages++; uData.xp += Math.floor(Math.random()*10)+5;
    const nextLvl = 50 * (uData.level * uData.level) + 50;
    if(uData.xp >= nextLvl){
        uData.level++; uData.xp=0;
        const emb = new EmbedBuilder().setTitle('🎉 LEVEL UP!').setDescription(`<@${uid}> reached **Level ${uData.level}**!`).setColor('Gold');
        message.channel.send({embeds:[emb]}).then(m=>setTimeout(()=>m.delete().catch(()=>{}),10000));
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

    try {
        // ========================
        // COMMANDS
        // ========================
        if (int.isChatInputCommand()) {
            if (commandName === 'ping') return int.reply({content:`🏓 Pong! ${client.ws.ping}ms`});
            if (commandName === 'uptime') {
                const d=Math.floor(client.uptime/86400000),h=Math.floor(client.uptime/3600000)%24,m=Math.floor(client.uptime/60000)%60,s=Math.floor(client.uptime/1000)%60;
                return int.reply({content:`⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`});
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
            if (commandName === 'slowmode') {
                if(!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return int.reply({content:'❌ No Permission',ephemeral:true});
                await int.channel.setRateLimitPerUser(options.getInteger('seconds'));
                return int.reply({content:`🐢 Slowmode set to ${options.getInteger('seconds')}s`});
            }
            if (commandName === 'addrole'||commandName==='removerole') {
                if(!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return int.reply({content:'❌ No Permission',ephemeral:true});
                const u=options.getUser('user'),r=options.getRole('role'),m=guild.members.cache.get(u.id);
                if(r.position>=member.roles.highest.position) return int.reply({content:'❌ Cannot modify higher role',ephemeral:true});
                if(commandName==='addrole'){await m.roles.add(r);return int.reply({content:`✅ Added ${r.name} to ${u.tag}`});}
                else {await m.roles.remove(r);return int.reply({content:`✅ Removed ${r.name} from ${u.tag}`});}
            }
            if (commandName === 'lockdown') {
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return int.reply({content:'❌ Admin Only',ephemeral:true});
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
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return int.reply({content:'❌ Admin Only',ephemeral:true});
                const msg=options.getString('set'); if(!guildSettings.has(guild.id)) guildSettings.set(guild.id,{});
                const d=guildSettings.get(guild.id); if(commandName==='welcome')d.welcome=msg;else d.leave=msg;
                guildSettings.set(guild.id,d); return int.reply({content:`✅ ${commandName.toUpperCase()} set: \n${msg}`});
            }
            if (commandName === 'level'||commandName==='rank'||commandName==='stats') {
                if(!levels.has(guild.id)) levels.set(guild.id,new Map());
                const sd=levels.get(guild.id),ud=sd.get(int.user.id)||{xp:0,level:0,messages:0},nl=50*(ud.level*ud.level)+50;
                if(commandName==='level'){
                    return int.reply({embeds:[new EmbedBuilder().setAuthor({name:int.user.tag,iconURL:int.user.displayAvatarURL()}).setTitle('📊 Your Level').addFields({name:'Level',value:`${ud.level}`,inline:true},{name:'XP',value:`${ud.xp}/${nl}`,inline:true},{name:'Messages',value:`${ud.messages}`,inline:true}).setColor('Purple')]});
                }
                if(commandName==='rank'){
                    const sorted=Array.from(sd.values()).sort((a,b)=>b.level-a.level||b.xp-a.xp);
                    const pos=sorted.findIndex(x=>x.level===ud.level&&x.xp===ud.xp)+1;
                    return int.reply({embeds:[new EmbedBuilder().setAuthor({name:int.user.tag,iconURL:int.user.displayAvatarURL()}).setTitle('🏅 Rank Card').setDescription(`Rank #${pos}`).addFields({name:'Level',value:`${ud.level}`,inline:true},{name:'Progress',value:`${'█'.repeat(Math.floor((ud.xp/nl)*10))}${'░'.repeat(10-Math.floor((ud.xp/nl)*10))} ${Math.floor((ud.xp/nl)*100)}%`}).setColor('Gold')]});
                }
                if(commandName==='stats'){
                    return int.reply({embeds:[new EmbedBuilder().setAuthor({name:int.user.tag,iconURL:int.user.displayAvatarURL()}).setTitle('📉 Stats').addFields({name:'Joined',value:`<t:${Math.floor(member.joinedTimestamp/1000)}:F>`,inline:false},{name:'Messages',value:`${ud.messages||0}`,inline:true},{name:'Level',value:`${ud.level||0}`,inline:true},{name:'Warnings',value:`${warns.get(int.user.id)?.length||0}`,inline:true}).setColor('Blue')]});
                }
            }
            if (commandName === 'leaderboard'){
                if(!levels.has(guild.id)) levels.set(guild.id,new Map());
                const sd=levels.get(guild.id);
                const sorted=Array.from(sd.entries()).map(([id,d])=>({id,...d})).sort((a,b)=>b.level-a.level||b.xp-a.xp).slice(0,10);
                let desc=''; sorted.forEach((u,i)=>desc+=`**${i+1}.** <@${u.id}> - Lvl: ${u.level} | XP: ${u.xp}\n`);
                return int.reply({embeds:[new EmbedBuilder().setTitle('🏆 LEADERBOARD').setDescription(desc||'No data').setColor('Orange')]});
            }
            if (commandName === 'setup-roles') {
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return int.reply({content:'❌ Admin Only',ephemeral:true});
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
                if(!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return int.reply({content:'❌ No Permission',ephemeral:true});
                const a=options.getInteger('amount'); if(a<1||a>100) return int.reply({content:'❌ 1-100 only',ephemeral:true});
                await int.channel.bulkDelete(a,true);
                return int.reply({content:`✅ Deleted ${a} messages`,ephemeral:true});
            }
            if (commandName === 'kick'||commandName==='ban') {
                const perm=commandName==='kick'?PermissionsBitField.Flags.KickMembers:PermissionsBitField.Flags.BanMembers;
                if(!member.permissions.has(perm)) return int.reply({content:'❌ No Permission',ephemeral:true});
                const u=options.getUser('user'),m=guild.members.cache.get(u.id);
                if(m.roles.highest.position>=member.roles.highest.position) return int.reply({content:'❌ Cannot mod higher role',ephemeral:true});
                if(commandName==='kick') await m.kick(`By: ${member.user.tag}`); else await m.ban({reason:`By: ${member.user.tag}`});
                return int.reply({content:`✅ ${commandName==='kick'?'Kicked':'Banned'} ${u.tag}`});
            }
            if (commandName === 'unban') {
                if(!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return int.reply({content:'❌ No Permission',ephemeral:true});
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
                if(!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return int.reply({content:'❌ No Permission',ephemeral:true});
                const u=options.getUser('user'),min=options.getInteger('minutes'),m=guild.members.cache.get(u.id);
                if(m.roles.highest.position>=member.roles.highest.position) return int.reply({content:'❌ Cannot mod higher role',ephemeral:true});
                await m.timeout(min*60000,`By: ${member.user.tag}`);
                return int.reply({content:`✅ Timed out ${u.tag} for ${min}m`});
            }
            if (commandName === 'lock'||commandName==='unlock') {
                if(!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return int.reply({content:'❌ No Permission',ephemeral:true});
                const s=commandName==='lock'?false:true; await int.channel.permissionOverwrites.edit(guild.id,{SendMessages:s});
                return int.reply({content:`🔒 Channel ${s?'Unlocked':'Locked'}`});
            }
            if (commandName === 'userinfo') {
                const u=options.getUser('user')||int.user,m=guild.members.cache.get(u.id);
                const emb=new EmbedBuilder().setAuthor({name:u.tag,iconURL:u.displayAvatarURL()}).setThumbnail(u.displayAvatarURL({size:1024})).addFields({name:'ID',value:u.id},{name:'Created',value:`<t:${Math.floor(u.createdTimestamp/1000)}:F>`},{name:'Joined',value:m?.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:F>`:'-'},{name:'Roles',value:m?.roles?.cache?.map(r=>r).join(', ')||'-'}).setColor('Blue');
                return int.reply({embeds:[emb]});
            }
            if (commandName === 'serverinfo') {
                const emb=new EmbedBuilder().setAuthor({name:guild.name,iconURL:guild.iconURL()}).setThumbnail(guild.iconURL({size:1024})).addFields({name:'Owner',value:`<@${guild.ownerId}>`},{name:'Members',value:`${guild.memberCount}`},{name:'Channels',value:`${guild.channels.cache.size}`},{name:'Created',value:`<t:${Math.floor(guild.createdTimestamp/1000)}:F>`}).setColor('Blue');
                return int.reply({embeds:[emb]});
            }
            if (commandName === 'avatar') return int.reply({content:(options.getUser('user')||int.user).displayAvatarURL({size:4096,dynamic:true})});
            if (commandName === 'coinflip') return int.reply({content:`🪙 Landed on: **${Math.random()>0.5?'TAIL 🟡':'HEAD 🔴'}**`});
            if (commandName === 'dice') return int.reply({content:`🎲 Rolled: **${Math.floor(Math.random()*6)+1}**`});
            if (commandName === '8ball') return int.reply({content:`🎱 8Ball says: **${['Yes','No','Maybe','Try again','Definitely','Dont do it','Probably'][Math.floor(Math.random()*7)]}**`});
            if (commandName === 'meme') {
                try { const res=await axios.get('https://meme-api.com/gimme'); return int.reply({embeds:[new EmbedBuilder().setTitle(res.data.title).setImage(res.data.url).setColor('Random')]}); }
                catch { return int.reply({content:'❌ Error',ephemeral:true}); }
            }
            // ✅ DM COMMAND LOGIC (SIGURADONG GAGANA NA)
            if (commandName === 'dm') {
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return int.reply({content:'❌ Kailangan mo ng Admin Permission!',ephemeral:true});
                const msg = options.getString('message'); 
                await int.reply({content:'🔄 Nagpapadala ng mensahe sa lahat... Huwag isara!',ephemeral:true});
                const members = await guild.members.fetch(); 
                let sent = 0, fail = 0;
                for(const [id, m] of members){
                    if(m.user.bot || m.id === int.user.id) continue;
                    try { 
                        await m.send(msg); 
                        sent++; 
                        await new Promise(r=>setTimeout(r,1000)); // Anti-Spam Delay
                    } catch { fail++; }
                }
                return int.followUp({content:`✅ TAPOS NA!\n📤 Naipadala: ${sent}\n❌ Nabigo/Naka-off DM: ${fail}`,ephemeral:true});
            }
            if (commandName === 'ticket-setup') {
                if(!member.permissions.has(PermissionsBitField.Flags.Administrator)) return int.reply({content:'❌ Admin Only',ephemeral:true});
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

    } catch (e) { console.error('❌ Error:',e); }
});

client.login(TOKEN);
