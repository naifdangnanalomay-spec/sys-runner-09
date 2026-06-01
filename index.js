const {
    Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Events, REST, Routes,
    Partials, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const moment = require('moment');
const axios = require('axios');

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
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User, 
        Partials.GuildMember
    ]
});

// 🔑 CREDENTIALS (Nasa Environment Variable na, WALA SA CODE)
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = '1507007071634329703'; 

// 📌 SLASH COMMANDS LIST
const commands = [
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
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

// 📌 AUTO RESPONDER SYSTEM
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild || !autoResponders.has(message.guild.id)) return;
    const trigger = message.content.toLowerCase().trim();
    const guildRespos = autoResponders.get(message.guild.id);
    if (guildRespos.has(trigger)) message.channel.send({ content: guildRespos.get(trigger) });
});

// 📌 MAIN INTERACTION HANDLER
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
    const { guild, member, commandName, options } = interaction;

    try {
        // ========================
        // 📌 SLASH COMMANDS EXECUTION
        // ========================
        if (interaction.isChatInputCommand()) {

            // ✅ PING
            if (commandName === 'ping') {
                return interaction.reply({ content: `🏓 Pong! Latency: **${client.ws.ping}ms**`, ephemeral: false });
            }

            // ✅ UPTIME
            if (commandName === 'uptime') {
                const days = Math.floor(client.uptime / 86400000);
                const hours = Math.floor(client.uptime / 3600000) % 24;
                const minutes = Math.floor(client.uptime / 60000) % 60;
                const seconds = Math.floor(client.uptime / 1000) % 60;
                return interaction.reply({ content: `⏱️ Uptime: **${days}d ${hours}h ${minutes}m ${seconds}s**` });
            }

            // ✅ /SETUP-ROLES
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

            // ✅ SAY / MEDIA
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

            // ✅ AUTO RESPONSE MANAGER
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

            // ✅ EMBED CREATOR
            if (commandName === 'embed') {
                const title = options.getString('title');
                const desc = options.getString('description');
                const color = options.getString('color') || '#2F3136';
                const emb = new EmbedBuilder().setTitle(title).setDescription(desc).setColor(color);
                await interaction.channel.send({ embeds: [emb] });
                return interaction.reply({ content: '✅ Embed created!', ephemeral: true });
            }

            // ✅ CLEAR MESSAGES
            if (commandName === 'clear') {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `ManageMessages`', ephemeral: true });
                const amount = options.getInteger('amount');
                if(amount < 1 || amount > 100) return interaction.reply({content: '❌ Dapat 1-100 lang ang bilang.', ephemeral:true});
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({content: `✅ Nabura ang **${amount}** mensahe.`, ephemeral:true});
            }

            // ✅ KICK
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

            // ✅ BAN
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

            // ✅ UNBAN
            if (commandName === 'unban') {
                if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                    return interaction.reply({ content: '❌ Kulang ka ng permission: `BanMembers`', ephemeral: true });
                const id = options.getString('userid');
                await guild.bans.remove(id);
                return interaction.reply({content: `✅ Na-unban na ang **${id}**`});
            }

            // ✅ WARN
            if (commandName === 'warn') {
                const user = options.getUser('user');
                const reason = options.getString('reason');
                if(!warns.has(user.id)) warns.set(user.id, []);
                warns.get(user.id).push({ reason: reason, by: member.user.tag, time: Date.now() });
                return interaction.reply({content: `✅ **${user.tag}** ay binigyan ng babala: *${reason}*`});
            }

            // ✅ UNWARN
            if (commandName === 'unwarn') {
                const user = options.getUser('user');
                const idx = options.getInteger('index') - 1;
                if(!warns.has(user.id) || !warns.get(user.id)[idx]) return interaction.reply({content: '❌ Walang ganyang babala o maling numero.', ephemeral:true});
                warns.get(user.id).splice(idx, 1);
                return interaction.reply({content: `✅ Tinanggal ang babala kay **${user.tag}**`});
            }

            // ✅ POLL
            if (commandName === 'poll') {
                const q = options.getString('question');
                const o1 = options.getString('option1');
                const o2 = options.getString('option2');
                const emb = new EmbedBuilder().setTitle(q).setDescription(`1️⃣ ${o1}\n\n2️⃣ ${o2}`).setColor('Gold');
                const msg = await interaction.reply({ embeds: [emb], fetchReply: true });
                await msg.react('1️⃣');
                await msg.react('2️⃣');
            }

            // ✅ TIMEOUT
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

            // ✅ LOCK / UNLOCK
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

            // ✅ USERINFO
            if (commandName === 'userinfo') {
                const user = options.getUser('user') || interaction.user;
                const memb = guild.members.cache.get(user.id);
                const emb = new EmbedBuilder()
                    .setAuthor({name: user.tag, iconURL: user.displayAvatarURL()})
                    .setThumbnail(user.displayAvatarURL({size:1024}))
                    .addFields(
                        {name: 'ID', value: user.id},
                        {name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:F>`},
                        {name: 'Joined Server', value: `<t:${Math.floor(memb.joinedTimestamp/1000)}:F>`},
                        {name: 'Roles', value: memb.roles.cache.map(r=>r).join(', ') || 'Wala'}
                    ).setColor('Blue');
                return interaction.reply({embeds:[emb]});
            }

            // ✅ SERVERINFO
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

            // ✅ AVATAR
            if (commandName === 'avatar') {
                const user = options.getUser('user||interaction.user');
                return interaction.reply({content: user.displayAvatarURL({size: 4096, dynamic: true})});
            }

            // ✅ GAMES & FUN
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

            // ✅ TICKET SYSTEM SETUP
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
            // 🎮 SELF ROLE HANDLERS
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

            // 🎟️ SUPPORT CATEGORY SELECT
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
                return interaction.reply({ content: 'Piliin kung anong uri ng tulong ang kailangan mo:', components: [menu], ephemeral: true });
            }

            // 🤝 PARTNERSHIP TICKET
            if (interaction.customId === 'btn_ticket_partnership') {
                const existingTicket = guild.channels.cache.find(c => c.name === `partnership-${interaction.user.username.toLowerCase()}`);
                if (existingTicket) return interaction.reply({ content: `❌ Mayroon ka nang bukas na ticket: ${existingTicket}`, ephemeral: true });

                const channel = await guild.channels.create({
                    name: `partnership-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
                    ]
                });
                const embed = new EmbedBuilder().setTitle('🤝 PARTNERSHIP APPLICATION').setDescription(`Kamusta ${interaction.user}! Pakilagay dito ang detalye ng inyong server para sa partnership.`).setColor('#2ECC71');
                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 CLOSE TICKET').setStyle(ButtonStyle.Danger));
                await channel.send({ embeds: [embed], components: [closeBtn] });
                return interaction.reply({ content: `✅ Ticket na ginawa: ${channel}`, ephemeral: true });
            }

            // 👔 APPLY STAFF TICKET
            if (interaction.customId === 'btn_ticket_staff') {
                const existingTicket = guild.channels.cache.find(c => c.name === `applystaff-${interaction.user.username.toLowerCase()}`);
                if (existingTicket) return interaction.reply({ content: `❌ Mayroon ka nang bukas na ticket: ${existingTicket}`, ephemeral: true });

                const channel = await guild.channels.create({
                    name: `applystaff-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
                    ]
                });
                const embed = new EmbedBuilder().setTitle('👔 STAFF APPLICATION').setDescription(`Kamusta ${interaction.user}! Pakisagot ang mga sumusunod: \n1. Pangalan / Age\n2. Bakit mo gustong maging staff?\n3. Gaano ka kadalas online?`).setColor('#3498DB');
                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 CLOSE TICKET').setStyle(ButtonStyle.Danger));
                await channel.send({ embeds: [embed], components: [closeBtn] });
                return interaction.reply({ content: `✅ Ticket na ginawa: ${channel}`, ephemeral: true });
            }

            // 🔒 CLOSE TICKET
            if (interaction.customId === 'close_ticket') {
                const canClose = member.roles.cache.has(STAFF_ROLE_ID) || member.permissions.has(PermissionsBitField.Flags.Administrator) || guild.ownerId === member.id;
                if (!canClose) return interaction.reply({ content: '❌ Tanging Staff, Admin o Owner lamang ang pwedeng magsara ng ticket.', ephemeral: true });
                await interaction.reply('🔒 Isasara ang ticket pagkalipas ng 5 segundo...');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }

        // ========================
        // 📌 SELECT MENU ACTIONS
        // ========================
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'menu_support_options') {
                const selected = interaction.values[0];
                let ticketType = (selected === 'opt_roster') ? 'ROSTER REGISTRATION' : 'GENERAL SUPPORT';

                const existingTicket = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
                if (existingTicket) return interaction.reply({ content: `❌ Mayroon ka nang bukas na ticket: ${existingTicket}`, ephemeral: true });

                const channel = await guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
                    ]
                });
                const embed = new EmbedBuilder().setTitle(`🎟️ ${ticketType}`).setDescription(`Kamusta ${interaction.user}! Pakilagay dito ang iyong detalye o tanong para matulungan ka namin.`).setColor('#F1C40F');
                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 CLOSE TICKET').setStyle(ButtonStyle.Danger));
                await channel.send({ embeds: [embed], components: [closeBtn] });
                return interaction.reply({ content: `✅ Ticket na ginawa: ${channel}`, ephemeral: true });
            }
        }

    } catch (err) {
        console.error('❌ Error:', err);
        if (interaction.replied || interaction.deferred) interaction.followUp({ content: '❌ May naganap na error habang ginagawa ang utos.', ephemeral: true });
        else interaction.reply({ content: '❌ May naganap na error habang ginagawa ang utos.', ephemeral: true });
    }
});

// 📌 ANTI-CRASH HANDLER
process.on('unhandledRejection', error => console.error('❌ Unhandled Rejection:', error));
process.on('uncaughtException', error => console.error('❌ Uncaught Exception:', error));

// 📌 LOGIN BOT
client.login(TOKEN);
