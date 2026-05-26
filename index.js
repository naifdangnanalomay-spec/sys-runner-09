const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    AttachmentBuilder
} = require('discord.js');
const moment = require('moment');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER']
});

const TOKEN = process.env.TOKEN || '';
const CLIENT_ID = '1507007071634329703E';
const OWNER_ID = '1250654354344775703';

const commands = [
    {
        name: 'embed',
        description: 'Create a custom embed message',
        options: [
            { name: 'title', type: 3, description: 'Embed title', required: true },
            { name: 'description', type: 3, description: 'Embed content', required: true },
            { name: 'color', type: 3, description: 'Embed color (hex or name)', required: false },
            { name: 'thumbnail', type: 3, description: 'Thumbnail image URL', required: false },
            { name: 'image', type: 3, description: 'Main image URL', required: false },
            { name: 'footer', type: 3, description: 'Footer text', required: false }
        ]
    },
    {
        name: 'editembed',
        description: 'Edit an existing embed message',
        options: [
            { name: 'message_id', type: 3, description: 'ID of the message to edit', required: true },
            { name: 'title', type: 3, description: 'New title', required: false },
            { name: 'description', type: 3, description: 'New content', required: false },
            { name: 'color', type: 3, description: 'New color', required: false },
            { name: 'image', type: 3, description: 'New image URL', required: false }
        ]
    },
    {
        name: 'banner',
        description: 'Send a large banner with text',
        options: [
            { name: 'text', type: 3, description: 'Text to display', required: true },
            { name: 'image_url', type: 3, description: 'Banner image URL', required: true },
            { name: 'color', type: 3, description: 'Text color', required: false }
        ]
    },
    {
        name: 'say',
        description: 'Send a message as the bot',
        options: [
            { name: 'message', type: 3, description: 'Message content', required: true },
            { name: 'channel', type: 7, description: 'Target channel', required: false }
        ]
    },
    {
        name: 'dm',
        description: 'Send a direct message to a user',
        options: [
            { name: 'user', type: 6, description: 'Target user', required: true },
            { name: 'message', type: 3, description: 'Message content', required: true }
        ]
    },
    { name: 'kick', description: 'Kick a member', options: [{ name: 'user', type: 6, description: 'User to kick', required: true }, { name: 'reason', type: 3, description: 'Reason', required: false }] },
    { name: 'ban', description: 'Ban a member', options: [{ name: 'user', type: 6, description: 'User to ban', required: true }, { name: 'reason', type: 3, description: 'Reason', required: false }] },
    { name: 'unban', description: 'Unban a user', options: [{ name: 'user_id', type: 3, description: 'User ID', required: true }] },
    { name: 'timeout', description: 'Timeout a user', options: [{ name: 'user', type: 6, description: 'User', required: true }, { name: 'duration', type: 3, description: 'Duration (1m, 1h, 1d)', required: true }, { name: 'reason', type: 3, description: 'Reason', required: false }] },
    { name: 'untimeout', description: 'Remove timeout from a user', options: [{ name: 'user', type: 6, description: 'User', required: true }] },
    { name: 'clear', description: 'Delete messages', options: [{ name: 'amount', type: 4, description: 'Number of messages', required: true }, { name: 'user', type: 6, description: 'Filter by user', required: false }] },
    { name: 'lock', description: 'Lock current channel' },
    { name: 'unlock', description: 'Unlock current channel' },
    { name: 'mute', description: 'Mute user in voice channel', options: [{ name: 'user', type: 6, description: 'User', required: true }] },
    { name: 'unmute', description: 'Unmute user in voice channel', options: [{ name: 'user', type: 6, description: 'User', required: true }] },
    { name: 'userinfo', description: 'Get user information', options: [{ name: 'user', type: 6, description: 'User', required: false }] },
    { name: 'serverinfo', description: 'Get server information' },
    { name: 'avatar', description: 'Get user avatar', options: [{ name: 'user', type: 6, description: 'User', required: false }] },
    { name: 'roleinfo', description: 'Get role information', options: [{ name: 'role', type: 8, description: 'Role', required: true }] },
    { name: 'channelinfo', description: 'Get channel information', options: [{ name: 'channel', type: 7, description: 'Channel', required: false }] },
    { name: 'botinfo', description: 'Get bot statistics' },
    { name: 'ping', description: 'Check bot latency' },
    { name: 'uptime', description: 'Check bot uptime' },
    { name: 'invite', description: 'Create server invite link' },
    { name: 'membercount', description: 'Show server member count' },
    { name: 'announce', description: 'Make an announcement', options: [{ name: 'channel', type: 7, description: 'Target channel', required: true }, { name: 'message', type: 3, description: 'Message', required: true }] },
    { name: 'addrole', description: 'Add role to user', options: [{ name: 'user', type: 6, description: 'User', required: true }, { name: 'role', type: 8, description: 'Role', required: true }] },
    { name: 'removerole', description: 'Remove role from user', options: [{ name: 'user', type: 6, description: 'User', required: true }, { name: 'role', type: 8, description: 'Role', required: true }] },
    { name: 'createrole', description: 'Create new role', options: [{ name: 'name', type: 3, description: 'Role name', required: true }, { name: 'color', type: 3, description: 'Role color', required: false }] },
    { name: 'createchannel', description: 'Create new channel', options: [{ name: 'name', type: 3, description: 'Channel name', required: true }, { name: 'type', type: 3, description: 'Channel type', required: true, choices: [{name: 'Text', value: 'text'}, {name: 'Voice', value: 'voice'}]}] },
    { name: 'coinflip', description: 'Flip a coin' },
    { name: 'dice', description: 'Roll a dice' },
    { name: '8ball', description: 'Ask the magic 8ball', options: [{ name: 'question', type: 3, description: 'Your question', required: true }] },
    { name: 'joke', description: 'Get a random joke' },
    { name: 'quote', description: 'Get a random quote' },
    { name: 'meme', description: 'Get a random meme' },
    { name: 'ascii', description: 'Convert text to ascii art', options: [{ name: 'text', type: 3, description: 'Text', required: true }] },
    { name: 'eval', description: 'Evaluate code (Owner Only)', options: [{ name: 'code', type: 3, description: 'Code', required: true }] }
];

client.on('ready', async () => {
    console.log(`✅ AZURA MAIN BOT ONLINE`);
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    console.log(`⚙️ Total Commands: ${commands.length}`);
    client.user.setActivity(`✨ /help | AZURA SYSTEM`, { type: "playing" });

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.post(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ All commands registered successfully');
    } catch (error) {
        console.error('❌ Command Registration Error:', error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, options, guild, member } = interaction;

    if (commandName === 'embed') {
        const title = options.getString('title');
        const desc = options.getString('description');
        const color = options.getString('color') || '#2F3136';
        const thumb = options.getString('thumbnail');
        const img = options.getString('image');
        const foot = options.getString('footer');

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Created by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic: true}) })
            .setTitle(title)
            .setDescription(desc)
            .setColor(color.toUpperCase() === 'BLUE' ? '#0000FF' : color.toUpperCase() === 'RED' ? '#FF0000' : color.toUpperCase() === 'GREEN' ? '#00FF00' : color)
            .setTimestamp();
        if(thumb) embed.setThumbnail(thumb);
        if(img) embed.setImage(img);
        if(foot) embed.setFooter({ text: foot });
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'editembed') {
        if(!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ephemeral: true, content: "❌ Missing Permissions"});
        const msgId = options.getString('message_id');
        const channel = interaction.channel;
        try {
            const message = await channel.messages.fetch(msgId);
            const oldEmbed = message.embeds[0];
            if(!oldEmbed) return interaction.reply({ephemeral: true, content: "❌ No embed found in that message"});
            
            const newEmbed = new EmbedBuilder(oldEmbed.toJSON());
            if(options.getString('title')) newEmbed.setTitle(options.getString('title'));
            if(options.getString('description')) newEmbed.setDescription(options.getString('description'));
            if(options.getString('color')) newEmbed.setColor(options.getString('color'));
            if(options.getString('image')) newEmbed.setImage(options.getString('image'));

            await message.edit({ embeds: [newEmbed] });
            return interaction.reply({ephemeral: true, content: "✅ Embed updated successfully"});
        } catch (e) {
            return interaction.reply({ephemeral: true, content: "❌ Cannot find message or invalid ID"});
        }
    }

    if (commandName === 'banner') {
        const text = options.getString('text');
        const img = options.getString('image_url');
        const color = options.getString('color') || 'Random';
        const embed = new EmbedBuilder()
            .setDescription(`**${text}**`)
            .setImage(img)
            .setColor(color)
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'say') {
        const msg = options.getString('message');
        const ch = options.getChannel('channel') || interaction.channel;
        try {
            await ch.send(msg);
            return interaction.reply({ephemeral: true, content: "✅ Message sent"});
        } catch {
            return interaction.reply({ephemeral: true, content: "❌ Failed to send message"});
        }
    }

    if (commandName === 'dm') {
        const user = options.getUser('user');
        const msg = options.getString('message');
        try {
            await user.send(msg);
            return interaction.reply({content: `✅ DM sent to **${user.tag}**`});
        } catch {
            return interaction.reply({content: "❌ Cannot DM this user (DMs disabled)"});
        }
    }

    if (commandName === 'kick') {
        if(!member.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ephemeral: true, content: "❌ Missing Permissions: Kick Members"});
        const target = options.getMember('user');
        const reason = options.getString('reason') || "No reason provided";
        if(target.id === interaction.user.id) return interaction.reply("❌ Cannot kick yourself");
        if(target.roles.highest.position >= member.roles.highest.position) return interaction.reply("❌ Cannot kick user with higher/equal role");
        
        try {
            await target.kick(reason);
            return interaction.reply(`👢 **${target.user.tag}** has been kicked. Reason: ${reason}`);
        } catch { return interaction.reply("❌ Operation failed") }
    }

    if (commandName === 'ban') {
        if(!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ephemeral: true, content: "❌ Missing Permissions: Ban Members"});
        const target = options.getMember('user');
        const reason = options.getString('reason') || "No reason provided";
        if(target.id === interaction.user.id) return interaction.reply("❌ Cannot ban yourself");
        if(target.roles.highest.position >= member.roles.highest.position) return interaction.reply("❌ Cannot ban user with higher/equal role");

        try {
            await target.ban({reason: reason});
            return interaction.reply(`🔨 **${target.user.tag}** has been banned. Reason: ${reason}`);
        } catch { return interaction.reply("❌ Operation failed") }
    }

    if (commandName === 'clear') {
        if(!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ephemeral: true, content: "❌ Missing Permissions: Manage Messages"});
        const amount = options.getInteger('amount');
        const user = options.getUser('user');

        try {
            let messages = await interaction.channel.messages.fetch({limit: 100});
            if(user) messages = messages.filter(m => m.author.id === user.id);
            const deleted = await interaction.channel.bulkDelete(messages.first(amount), true);
            return interaction.reply(`🧹 Deleted **${deleted.size}** messages`);
        } catch { return interaction.reply("❌ Cannot delete messages older than 14 days") }
    }

    if (commandName === 'lock' || commandName === 'unlock') {
        if(!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ephemeral: true, content: "❌ Missing Permissions: Manage Channels"});
        const state = commandName === 'lock' ? false : true;
        await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: state });
        return interaction.reply(state ? "🔓 Channel Unlocked" : "🔒 Channel Locked");
    }

    if (commandName === 'userinfo') {
        const user = options.getUser('user') || interaction.user;
        const member = guild.members.cache.get(user.id);
        const embed = new EmbedBuilder()
            .setAuthor({name: user.tag, iconURL: user.displayAvatarURL()})
            .setThumbnail(user.displayAvatarURL({size: 4096}))
            .addFields(
                {name: '🆔 ID', value: user.id, inline: true},
                {name: '📅 Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:F>`, inline: true},
                {name: '📥 Joined', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>`, inline: true},
                {name: '🎭 Roles', value: member.roles.cache.map(r => r).join(', ') || 'None', inline: false},
                {name: '⚡ Booster', value: member.premiumSince ? 'Yes ✨' : 'No', inline: true},
                {name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true}
            )
            .setColor(member.displayHexColor || '#2F3136')
            .setTimestamp();
        return interaction.reply({embeds: [embed]});
    }

    if (commandName === 'serverinfo') {
        const embed = new EmbedBuilder()
            .setAuthor({name: guild.name, iconURL: guild.iconURL()})
            .setThumbnail(guild.iconURL({size: 4096}))
            .addFields(
                {name: '🆔 ID', value: guild.id, inline: true},
                {name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true},
                {name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:F>`, inline: true},
                {name: '👥 Members', value: `Total: ${guild.memberCount}\nHumans: ${guild.members.cache.filter(m => !m.user.bot).size}\nBots: ${guild.members.cache.filter(m => m.user.bot).size}`, inline: true},
                {name: '💬 Channels', value: `Text: ${guild.channels.cache.filter(c => c.type === 0).size}\nVoice: ${guild.channels.cache.filter(c => c.type === 2).size}`, inline: true},
                {name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true},
                {name: '💎 Boost Level', value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount} Boosts)`, inline: true}
            )
            .setColor('#2F3136')
            .setImage(guild.bannerURL({size: 4096}))
            .setTimestamp();
        return interaction.reply({embeds: [embed]});
    }

    if (commandName === 'avatar') {
        const user = options.getUser('user') || interaction.user;
        const embed = new EmbedBuilder()
            .setAuthor({name: `${user.tag}'s Avatar`, iconURL: user.displayAvatarURL()})
            .setImage(user.displayAvatarURL({size: 4096, dynamic: true}))
            .setColor('Random');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('PNG').setURL(user.displayAvatarURL({format: 'png'})).setStyle(ButtonStyle.Link),
            new ButtonBuilder().setLabel('JPG').setURL(user.displayAvatarURL({format: 'jpg'})).setStyle(ButtonStyle.Link),
            new ButtonBuilder().setLabel('WEBP').setURL(user.displayAvatarURL({format: 'webp'})).setStyle(ButtonStyle.Link)
        );
        return interaction.reply({embeds: [embed], components: [row]});
    }

    if (commandName === 'ping') {
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        return interaction.editReply(`🏓 **Pong!**\n⌛ Latency: **${latency}ms**\n⚡ API: **${apiLatency}ms**`);
    }

    if (commandName === 'botinfo') {
        const embed = new EmbedBuilder()
            .setTitle('🤖 AZURA BOT SYSTEM')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(`Powerful bot designed for management and entertainment.\nServing since <t:${Math.floor(client.user.createdTimestamp/1000)}:D>.`)
            .addFields(
                {name: '📌 Version', value: '1.5.0 (Ultimate)', inline: true},
                {name: '⏱️ Uptime', value: `${Math.floor(process.uptime()/3600)}h ${Math.floor((process.uptime()%3600)/60)}m`, inline: true},
                {name: '💾 Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true},
                {name: '👨‍💻 Developer', value: `<@${OWNER_ID}>`, inline: true}
            )
            .setColor('Gold')
            .setTimestamp();
        return interaction.reply({embeds: [embed]});
    }

    if (commandName === 'coinflip') {
        const res = Math.random() < 0.5 ? '🪙 **HEADS**' : '🪙 **TAILS**';
        return interaction.reply(res);
    }
    if (commandName === 'dice') {
        return interaction.reply(`🎲 **${Math.floor(Math.random() * 6) + 1}**`);
    }
    if (commandName === '8ball') {
        const ans = ['Yes', 'No', 'Maybe', 'Probably', 'Do not do it', 'Do it now', 'Ask again later', 'Cannot predict now'];
        return interaction.reply(`🎱 Question: *${options.getString('question')}*\nAnswer: **${ans[Math.floor(Math.random() * ans.length)]}**`);
    }
    if (commandName === 'ascii') {
        const text = options.getString('text').toUpperCase();
        const map = {'A':'🅰️','B':'🅱️','C':'🅲️','D':'🅳️','E':'🅴️','F':'🅵️','G':'🅶️','H':'🅷️','I':'🅸️','J':'🅹️','K':'🅺️','L':'🅻️','M':'🅼️','N':'🅽️','O':'🅾️','P':'🅿️','Q':'🆀️','R':'🆁️','S':'🆂️','T':'🆃️','U':'🆄️','V':'🆅️','W':'🆆️','X':'🆇️','Y':'🆈️','Z':'🆉️',' ':'   '};
        let res = '';
        for(const c of text) res += map[c] || c;
        return interaction.reply(res);
    }

    if (commandName === 'eval') {
        if(interaction.user.id !== OWNER_ID) return interaction.reply({ephemeral: true, content: "❌ UNAUTHORIZED ACCESS"});
        try {
            const code = options.getString('code');
            let evaled = eval(code);
            if(typeof evaled !== 'string') evaled = require('util').inspect(evaled);
            return interaction.reply(`\`\`\`js\n${evaled.slice(0,1900)}\n\`\`\``);
        } catch (e) { return interaction.reply(`\`\`\`diff\n- ERROR: ${e}\n\`\`\``) }
    }
});

client.on('error', () => {});
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

client.login(TOKEN);
