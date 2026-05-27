const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    Partials,
    ChannelType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const moment = require('moment');
const axios = require('axios');

const BANNER_URL = 'https://cdn.discordapp.com/attachments/1508552737053478994/1508568748624445531/att.yYqjZASWT0CYo0mYBzb2CFulOHxOD4TFMJU8V1zqNrE.jpg';
const TICKET_GIF = 'https://cdn.discordapp.com/attachments/1397829995908567092/1508712683304783912/fa32ef2b-9939-4806-9495-27ca4803562c.gif';
const STAFF_ROLE_ID = '1508714923696455740'; 

// ✅ Storage para sa mga Warn (Nakaimor habang naka-on ang bot)
const warns = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans
    ],
    partials: [
        Partials.Message, Partials.Channel, Partials.Reaction, 
        Partials.User, Partials.GuildMember
    ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1507007071634329703';

const commands = [
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'setup-roles', description: 'Send self-role panel' },
    { name: 'ticket-setup', description: 'Setup the ticket system' },
    { name: 'say', description: 'Send message as bot', options: [{ name: 'message', type: 3, description: 'Message content', required: true }] },
    { name: 'embed', description: 'Create embed', options: [
        { name: 'title', type: 3, description: 'Embed title', required: true },
        { name: 'description', type: 3, description: 'Embed description', required: true },
        { name: 'color', type: 3, description: 'Hex color', required: false }
    ]},
    { name: 'clear', description: 'Delete messages', options: [{ name: 'amount', type: 4, description: '1-100', required: true }] },
    { name: 'kick', description: 'Kick member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    { name: 'ban', description: 'Ban member', options: [{ name: 'user', type: 6, description: 'Target user', required: true }] },
    // ✅ BAGO: UNBAN
    { name: 'unban', description: 'Unban a user', options: [{ name: 'userid', type: 3, description: 'User ID to unban', required: true }] },
    // ✅ BAGO: WARN & UNWARN
    { name: 'warn', description: 'Warn a user', options: [
        { name: 'user', type: 6, description: 'Target user', required: true },
        { name: 'reason', type: 3, description: 'Reason for warning', required: true }
    ]},
    { name: 'unwarn', description: 'Remove warning from user', options: [
        { name: 'user', type: 6, description: 'Target user', required: true },
        { name: 'index', type: 4, description: 'Warning number to remove', required: true }
    ]},
    // ✅ BAGO: POLL
    { name: 'poll', description: 'Create a simple poll', options: [
        { name: 'question', type: 3, description: 'Poll question/title', required: true },
        { name: 'option1', type: 3, description: 'First option', required: true },
        { name: 'option2', type: 3, description: 'Second option', required: true },
        { name: 'option3', type: 3, description: 'Third option (optional)', required: false },
        { name: 'option4', type: 3, description: 'Fourth option (optional)', required: false }
    ]},
    { name: 'timeout', description: 'Timeout user', options: [
        { name: 'user', type: 6, description: 'Target user', required: true },
        { name: 'minutes', type: 4, description: 'Timeout minutes', required: true }
    ]},
    { name: 'lock', description: 'Lock channel' },
    { name: 'unlock', description: 'Unlock channel' },
    { name: 'userinfo', description: 'User information', options: [{ name: 'user', type: 6, description: 'Target user', required: false }] },
    { name: 'serverinfo', description: 'Server information' },
    { name: 'avatar', description: 'Get avatar', options: [{ name: 'user', type: 6, description: 'Target user', required: false }] },
    { name: 'coinflip', description: 'Flip coin' },
    { name: 'dice', description: 'Roll dice' },
    { name: '8ball', description: 'Magic 8ball', options: [{ name: 'question', type: 3, description: 'Your question', required: true }] },
    { name: 'meme', description: 'Random meme' }
];

client.once('ready', async () => {
    console.log(`${client.user.tag} ONLINE`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Commands Registered Successfully');
    } catch (err) { 
        console.error('❌ Error Registering Commands:', err); 
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
    const { guild, member } = interaction;

    try {
        if (interaction.isChatInputCommand()) {
            const { commandName, options } = interaction;

            if (commandName === 'ping') return interaction.reply(`Pong: ${client.ws.ping}ms`);
            
            if (commandName === 'uptime') return interaction.reply(`Uptime: ${moment.duration(client.uptime).humanize()}`);
            
            if (commandName === 'setup-roles') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) 
                    return interaction.reply({ content: '❌ Wala kang pahintulot gawin ito.', ephemeral: true });
                
                await interaction.deferReply();
                const embed = new EmbedBuilder()
                    .setTitle('S E L F   R O L E')
                    .setDescription('<@&1508559284156235878>\n<@&1508559055721861271>\n<@&1508559118913503452>\n<@&1508559365974659172>')
                    .setColor(0x000000)
                    .setImage(BANNER_URL);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('FIVEM').setCustomId('role_fivem'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('ROBLOX').setCustomId('role_roblox'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('VALO').setCustomId('role_valo'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('18+').setCustomId('role_18')
                );
                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            if (commandName === 'ticket-setup') {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) 
                    return interaction.reply({ content: '❌ Wala kang pahintulot gawin ito.', ephemeral: true });
                
                await interaction.deferReply();
                const embed = new EmbedBuilder()
                    .setTitle('AZURA ORG TICKET SUPPORT')
                    .setDescription('Please select which type of ticket you want to open \n\n ➤ – AZURA ORG SUPPORT\n ➤ – APPLY FOR STAFF \n ➤ – Partnership')
                    .setColor(0x000000)
                    .setImage(TICKET_GIF);
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Ticket Support').setCustomId('btn_ticket_support'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Apply Staff').setCustomId('btn_ticket_staff'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Partnership').setCustomId('btn_ticket_partner')
                );
                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            if (commandName === 'clear') {
                const amount = options.getInteger('amount');
                if (amount < 1 || amount > 100) 
                    return interaction.reply({ content: '❌ Dapat numero sa pagitan ng 1 at 100.', ephemeral: true });
                
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({ content: `✅ Matagumpay na binura ang ${amount} na mensahe.`, ephemeral: true });
            }
            
            if (commandName === 'say') { 
                await interaction.deferReply({ ephemeral: true });
                await interaction.channel.send(options.getString('message')); 
                return interaction.editReply({ content: '✅ Ipinadala' }); 
            }
            
            if (commandName === 'embed') {
                await interaction.deferReply();
                const title = options.getString('title');
                let description = options.getString('description');
                const color = options.getString('color') || '#5865F2';
                const urlRegex = /(https?:\/\/[^\s]+)/gi;
                const match = description.match(urlRegex);
                const embed = new EmbedBuilder().setTitle(title).setColor(color);
                
                if (match) { 
                    embed.setImage(match[0]); 
                    description = description.replace(urlRegex, '').trim(); 
                }
                embed.setDescription(description || ' ');
                return interaction.editReply({ embeds: [embed] });
            }
            
            if (commandName === 'kick') { 
                const user = options.getMember('user');
                await user.kick(); 
                return interaction.reply(`✅ Pinalayas si ${user.user.tag}`); 
            }
            
            if (commandName === 'ban') { 
                const user = options.getMember('user');
                await user.ban(); 
                return interaction.reply(`✅ Banned si ${user.user.tag}`); 
            }

            // ✅ BAGO: UNBAN COMMAND
            if (commandName === 'unban') {
                if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                    return interaction.reply({ content: '❌ Wala kang pahintulot mag-unban.', ephemeral: true });
                
                const userId = options.getString('userid');
                try {
                    await guild.bans.remove(userId);
                    return interaction.reply(`✅ Matagumpay na na-unban ang user ID: **${userId}**`);
                } catch (e) {
                    return interaction.reply({ content: '❌ Hindi mahanap o hindi naka-ban ang user na ito.', ephemeral: true });
                }
            }

            // ✅ BAGO: WARN COMMAND
            if (commandName === 'warn') {
                if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
                    return interaction.reply({ content: '❌ Wala kang pahintulot magbigay ng babala.', ephemeral: true });
                
                const user = options.getUser('user');
                const reason = options.getString('reason');
                const guildId = guild.id;
                const userId = user.id;

                if (!warns.has(guildId)) warns.set(guildId, new Map());
                if (!warns.get(guildId).has(userId)) warns.get(guildId).set(userId, []);

                warns.get(guildId).get(userId).push({ reason: reason, by: member.user.tag, date: new Date().toLocaleString() });
                return interaction.reply(`⚠️ **${user.tag}** ay binigyan ng babala.\n**Dahilan:** ${reason}`);
            }

            // ✅ BAGO: UNWARN COMMAND
            if (commandName === 'unwarn') {
                if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
                    return interaction.reply({ content: '❌ Wala kang pahintulot magbura ng babala.', ephemeral: true });
                
                const user = options.getUser('user');
                const index = options.getInteger('index') - 1; // -1 kasi nagsisimula sa 0 ang listahan
                const guildId = guild.id;
                const userId = user.id;

                if (!warns.has(guildId) || !warns.get(guildId).has(userId) || warns.get(guildId).get(userId).length === 0)
                    return interaction.reply({ content: '❌ Walang nakitang babala para sa user na ito.', ephemeral: true });

                const userWarns = warns.get(guildId).get(userId);
                if (index < 0 || index >= userWarns.length)
                    return interaction.reply({ content: '❌ Maling numero ng babala.', ephemeral: true });

                userWarns.splice(index, 1);
                return interaction.reply(`✅ Binura ang babala #${index+1} kay **${user.tag}**`);
            }

            // ✅ BAGO: POLL COMMAND
            if (commandName === 'poll') {
                await interaction.deferReply();
                const question = options.getString('question');
                const opts = [options.getString('option1'), options.getString('option2')];
                if (options.getString('option3')) opts.push(options.getString('option3'));
                if (options.getString('option4')) opts.push(options.getString('option4'));

                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
                let description = '';
                for (let i = 0; i < opts.length; i++) description += `${emojis[i]} ${opts[i]}\n`;

                const pollEmbed = new EmbedBuilder()
                    .setTitle(`📊 ${question}`)
                    .setDescription(description)
                    .setColor('Random')
                    .setFooter({ text: `Gawa ni: ${member.user.tag}` });

                const msg = await interaction.editReply({ embeds: [pollEmbed] });
                for (let i = 0; i < opts.length; i++) await msg.react(emojis[i]);
                return;
            }
            
            if (commandName === 'timeout') { 
                const user = options.getMember('user');
                const minutes = options.getInteger('minutes');
                await user.timeout(minutes * 60000); 
                return interaction.reply(`✅ Naka-timeout ng ${minutes} minuto si ${user.user.tag}`); 
            }
            
            if (commandName === 'lock') { 
                await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }); 
                return interaction.reply('🔒 Channel Naka-Lock'); 
            }
            
            if (commandName === 'unlock') { 
                await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true }); 
                return interaction.reply('🔓 Channel Naka-Unlock'); 
            }
            
            if (commandName === 'userinfo') { 
                const user = options.getUser('user') || interaction.user; 
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle(user.tag).setURL(user.displayAvatarURL()).setColor('#5865F2').setThumbnail(user.displayAvatarURL())] }); 
            }
            
            if (commandName === 'serverinfo') {
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle(guild.name).setDescription(`Miyembro: ${guild.memberCount}`).setColor('#5865F2')]});
            }
            
            if (commandName === 'avatar') {
                const user = options.getUser('user') || interaction.user; 
                return interaction.reply(user.displayAvatarURL({dynamic: true, size: 4096}));
            }
            
            if (commandName === 'coinflip') {
                return interaction.reply(Math.random() > 0.5 ? '🤑 Heads' : '💰 Tails');
            }
            
            if (commandName === 'dice') {
                return interaction.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
            }
            
            if (commandName === '8ball') {
                const sagot = ['Oo', 'Hindi', 'Baka', 'Huwag mong gawin', 'Subukan mo', 'Siguro'];
                return interaction.reply(sagot[Math.floor(Math.random() * sagot.length)]);
            }
            
            if (commandName === 'meme') {
                try {
                    await interaction.deferReply();
                    const res = await axios.get('https://meme-api.com/gimme', { timeout: 5000 });
                    return interaction.editReply({ 
                        embeds: [new EmbedBuilder()
                            .setTitle(res.data.title || 'Random Meme')
                            .setImage(res.data.url)
                            .setColor('Random')
                        ] 
                    });
                } catch (e) {
                    return interaction.editReply({content: '❌ Hindi makakuha ng meme, subukan ulit mamaya.'});
                }
            }
        }

        if (interaction.isButton()) {
            // ✅ TICKET SUPPORT → MENU
            if (interaction.customId === 'btn_ticket_support') {
                const selectMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('menu_support_options')
                        .setPlaceholder('Make a selection')
                        .addOptions([
                            { label: '📋 ROSTER REGISTRATION', value: 'opt_roster', description: 'Magparehistro / Ilapag ang Roster niyo' },
                            { label: '❓ GENERAL SUPPORT', value: 'opt_support', description: 'Tulong, Tanong o Ibang usapin' }
                        ])
                );
                return interaction.reply({ content: '**Make a selection**', components: [selectMenu], ephemeral: true });
            }

            // ✅ APPLY STAFF
            if (interaction.customId === 'btn_ticket_staff') {
                await interaction.deferReply({ ephemeral: true });
                const channel = await guild.channels.create({
                    name: `applystaff-${member.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Close Ticket').setCustomId('close_ticket'));
                await channel.send({
                    content: `📝 — APPLY FOR STAFF —
━━━━━━━━━━━━
Isulat dito ang sumusunod:

1️⃣ Pangalan / Discord Tag:
2️⃣ Edad:
3️⃣ Bakit mo gustong maging Staff?
4️⃣ Ano ang maibibigay mo sa server?

━━━━━━━━━━━━
Salamat sa pag-apply, babasahin namin agad.`,
                    components: [closeBtn]
                });
                return interaction.editReply({ content: `✅ Ticket created: ${channel}` });
            }

            // ✅ PARTNERSHIP
            if (interaction.customId === 'btn_ticket_partner') {
                await interaction.deferReply({ ephemeral: true });
                const channel = await guild.channels.create({
                    name: `partner-${member.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Close Ticket').setCustomId('close_ticket'));
                await channel.send({
                    content: `🤝 — PARTNERSHIP APPLICATION —
━━━━━━━━━━━━
Ilagay ang sumusunod na detalye para makipag-partnership:

1️⃣ Pangalan ng Grupo:
2️⃣ Maikling Pangalan (4-8 letra lang):
3️⃣ Uri ng Grupo:
4️⃣ Discord Link (Always Represent):
5️⃣ Pangalan & Tag ng Lider:

━━━━━━━━━━━━
✅ Pag tinanggap: **ILALAGAY KO KAYO SA PARTNERSHIP CATEGORY** at ilalagay ko ang detalye at link niyo sa aming listahan.

ℹ️ **WEBSITE:**
Unfinished pa ito, pero kung gusto niyo sumali, **ILAPAG NIYO LANG ANG USER ID NIYO**

⚠️ **PAALALA:**
Kapag hindi na active o wala na sa galaw — **TANGGALIN KO AGAD** sa listahan.`,
                    components: [closeBtn]
                });
                return interaction.editReply({ content: `✅ Ticket created: ${channel}` });
            }

            // ✅ CLOSE TICKET
            if (interaction.customId === 'close_ticket') {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) 
                    return interaction.reply({ content: '❌ Staff lang ang pwedeng magsara nito!', ephemeral: true });
                
                await interaction.reply('🔒 Isasara ito pagkalipas ng 5 segundo...');
                setTimeout(() => interaction.channel.delete().catch(e => console.error(e)), 5000);
            }

            // ✅ ROLE SYSTEM (INAYOS NA! GUMAGANA NA)
            const ROLE_IDS = {
                'role_fivem': '1508559284156235878',
                'role_roblox': '1508559055721861271',
                'role_valo': '1508559118913503452',
                'role_18': '1508559365974659172'
            };

            if (ROLE_IDS[interaction.customId]) {
                const roleId = ROLE_IDS[interaction.customId];
                const role = guild.roles.cache.get(roleId);

                if (!role) return interaction.reply({ content: '❌ Role hindi matagpuan sa server.', ephemeral: true });

                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.reply({ content: `❌ Tinanggal ang role: **${role.name}**`, ephemeral: true });
                } else {
                    await member.roles.add(roleId);
                    return interaction.reply({ content: `✅ Nakuha mo na ang role: **${role.name}**`, ephemeral: true });
                }
            }
        }

        // ✅ SELECT MENU LOGIC
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'menu_support_options') {
                await interaction.deferUpdate();
                const choice = interaction.values[0];

                const channel = await guild.channels.create({
                    name: `support-${member.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });

                const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Close Ticket').setCustomId('close_ticket'));
                let content = '';

                if (choice === 'opt_roster') {
                    content = `📋 — ROSTER REGISTRATION —
━━━━━━━━━━━━
Ilagay ang sumusunod:

1️⃣ Pangalan ng Grupo:
2️⃣ Maikling Pangalan (4-8 letra lang):
3️⃣ Uri ng Grupo:
4️⃣ Discord Link (Always Represent):
5️⃣ Pangalan & Tag ng Lider:

━━━━━━━━━━━━
✅ Pag tinanggap: **AKO MISMO ANG GAGAWA NG SARILI NIYONG TEXT CHANNEL AT VOICE CHANNEL**
✅ **SA INYO LANG BUKAS — KAYO AT MIYEMBRO NIYO LANG ANG MAKAKAPASOK**

ℹ️ **WEBSITE:**
Unfinished pa ito, pero kung gusto niyo sumali, **ILAPAG NIYO LANG ANG USER ID NIYO**

⚠️ **PAALALA:**
Kapag hindi na active o wala na sa galaw — **TANGGALIN KO AGAD** ang lahat.`;
                }

                if (choice === 'opt_support') {
                    content = `❓ — GENERAL SUPPORT —
━━━━━━━━━━━━
Isulat dito kung ano ang kailangan niyo o itatanong:

• Problema?
• Tanong?
• Ibang bagay?

━━━━━━━━━━━━
Sasagutin namin kayo agad.`;
                }

                await channel.send({ content: content, components: [closeBtn] });
                await interaction.followUp({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
            }
        }

    } catch (err) { 
        console.error('❌ ERROR:', err); 
        const errorMsg = '❌ May naganap na hindi inaasahang mali!';
        if (interaction.replied || interaction.deferred) interaction.followUp({content: errorMsg, ephemeral: true});
        else interaction.reply({content: errorMsg, ephemeral: true});
    }
});

client.login(TOKEN);
