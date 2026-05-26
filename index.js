const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    Partials,
    ChannelType
} = require('discord.js');

const moment = require('moment');
const axios = require('axios');

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
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
    ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1507007071634329703';
const OWNER_ID = '1250654354344775703';

const commands = [

    { name: 'ping', description: 'Check bot latency' },

    { name: 'uptime', description: 'Check bot uptime' },

    {
        name: 'say',
        description: 'Send message as bot',
        options: [
            {
                name: 'message',
                type: 3,
                description: 'Message content',
                required: true
            }
        ]
    },

    {
        name: 'embed',
        description: 'Create embed',
        options: [
            {
                name: 'title',
                type: 3,
                description: 'Embed title',
                required: true
            },
            {
                name: 'description',
                type: 3,
                description: 'Embed description',
                required: true
            },
            {
                name: 'color',
                type: 3,
                description: 'Hex color',
                required: false
            }
        ]
    },

    {
        name: 'clear',
        description: 'Delete messages',
        options: [
            {
                name: 'amount',
                type: 4,
                description: '1-100',
                required: true
            }
        ]
    },

    {
        name: 'kick',
        description: 'Kick member',
        options: [
            {
                name: 'user',
                type: 6,
                description: 'Target user',
                required: true
            }
        ]
    },

    {
        name: 'ban',
        description: 'Ban member',
        options: [
            {
                name: 'user',
                type: 6,
                description: 'Target user',
                required: true
            }
        ]
    },

    {
        name: 'timeout',
        description: 'Timeout user',
        options: [
            {
                name: 'user',
                type: 6,
                description: 'Target user',
                required: true
            },
            {
                name: 'minutes',
                type: 4,
                description: 'Timeout minutes',
                required: true
            }
        ]
    },

    {
        name: 'lock',
        description: 'Lock channel'
    },

    {
        name: 'unlock',
        description: 'Unlock channel'
    },

    {
        name: 'userinfo',
        description: 'User information',
        options: [
            {
                name: 'user',
                type: 6,
                description: 'Target user',
                required: false
            }
        ]
    },

    {
        name: 'serverinfo',
        description: 'Server information'
    },

    {
        name: 'avatar',
        description: 'Get avatar',
        options: [
            {
                name: 'user',
                type: 6,
                description: 'Target user',
                required: false
            }
        ]
    },

    {
        name: 'coinflip',
        description: 'Flip coin'
    },

    {
        name: 'dice',
        description: 'Roll dice'
    },

    {
        name: '8ball',
        description: 'Magic 8ball',
        options: [
            {
                name: 'question',
                type: 3,
                description: 'Your question',
                required: true
            }
        ]
    },

    {
        name: 'meme',
        description: 'Random meme'
    }
];

client.once('ready', async () => {

    console.log(`✅ ${client.user.tag} ONLINE`);
    console.log(`⚡ Commands Loaded: ${commands.length}`);

    client.user.setActivity('✨ AZURA SYSTEM');

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log('✅ Slash Commands Registered');

    } catch (err) {
        console.error(err);
    }
});

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, guild, member } = interaction;

    try {

        // PING
        if (commandName === 'ping') {

            return interaction.reply(
                `🏓 Pong: ${client.ws.ping}ms`
            );
        }

        // UPTIME
        if (commandName === 'uptime') {

            const uptime = moment
                .duration(client.uptime)
                .humanize();

            return interaction.reply(
                `⏰ Uptime: ${uptime}`
            );
        }

        // SAY
        if (commandName === 'say') {

            const message = options.getString('message');

            await interaction.channel.send(message);

            return interaction.reply({
                content: '✅ Message Sent',
                ephemeral: true
            });
        }

        // EMBED
        if (commandName === 'embed') {

            const title = options.getString('title');
            const description = options.getString('description');
            const color = options.getString('color') || '#5865F2';

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        }

        // CLEAR
        if (commandName === 'clear') {

            if (!member.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            )) {
                return interaction.reply({
                    content: '❌ Missing Permission',
                    ephemeral: true
                });
            }

            const amount = options.getInteger('amount');

            if (amount < 1 || amount > 100) {
                return interaction.reply({
                    content: '❌ Choose 1-100',
                    ephemeral: true
                });
            }

            await interaction.channel.bulkDelete(amount, true);

            return interaction.reply({
                content: `🧹 Deleted ${amount} messages`,
                ephemeral: true
            });
        }

        // KICK
        if (commandName === 'kick') {

            if (!member.permissions.has(
                PermissionsBitField.Flags.KickMembers
            )) {
                return interaction.reply({
                    content: '❌ Missing Permission',
                    ephemeral: true
                });
            }

            const target = options.getMember('user');

            if (!target) {
                return interaction.reply('❌ User not found');
            }

            await target.kick();

            return interaction.reply(
                `👢 ${target.user.tag} kicked`
            );
        }

        // BAN
        if (commandName === 'ban') {

            if (!member.permissions.has(
                PermissionsBitField.Flags.BanMembers
            )) {
                return interaction.reply({
                    content: '❌ Missing Permission',
                    ephemeral: true
                });
            }

            const target = options.getMember('user');

            if (!target) {
                return interaction.reply('❌ User not found');
            }

            await target.ban();

            return interaction.reply(
                `🔨 ${target.user.tag} banned`
            );
        }

        // TIMEOUT
        if (commandName === 'timeout') {

            if (!member.permissions.has(
                PermissionsBitField.Flags.ModerateMembers
            )) {
                return interaction.reply({
                    content: '❌ Missing Permission',
                    ephemeral: true
                });
            }

            const target = options.getMember('user');
            const minutes = options.getInteger('minutes');

            await target.timeout(
                minutes * 60 * 1000
            );

            return interaction.reply(
                `⏳ ${target.user.tag} timed out for ${minutes} minutes`
            );
        }

        // LOCK
        if (commandName === 'lock') {

            await interaction.channel.permissionOverwrites.edit(
                guild.roles.everyone,
                {
                    SendMessages: false
                }
            );

            return interaction.reply('🔒 Channel Locked');
        }

        // UNLOCK
        if (commandName === 'unlock') {

            await interaction.channel.permissionOverwrites.edit(
                guild.roles.everyone,
                {
                    SendMessages: true
                }
            );

            return interaction.reply('🔓 Channel Unlocked');
        }

        // USERINFO
        if (commandName === 'userinfo') {

            const user =
                options.getUser('user') ||
                interaction.user;

            const memberData =
                guild.members.cache.get(user.id);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: user.tag,
                    iconURL: user.displayAvatarURL({
                        dynamic: true
                    })
                })
                .setThumbnail(
                    user.displayAvatarURL({
                        dynamic: true,
                        size: 4096
                    })
                )
                .addFields(
                    {
                        name: '🆔 ID',
                        value: user.id,
                        inline: true
                    },
                    {
                        name: '📅 Created',
                        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                        inline: true
                    },
                    {
                        name: '📥 Joined',
                        value: memberData
                            ? `<t:${Math.floor(memberData.joinedTimestamp / 1000)}:F>`
                            : 'Unknown'
                    }
                )
                .setColor('#5865F2');

            return interaction.reply({
                embeds: [embed]
            });
        }

        // SERVERINFO
        if (commandName === 'serverinfo') {

            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setThumbnail(
                    guild.iconURL({ dynamic: true })
                )
                .addFields(
                    {
                        name: '👥 Members',
                        value: `${guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: '🆔 Server ID',
                        value: guild.id,
                        inline: true
                    }
                )
                .setColor('#5865F2');

            return interaction.reply({
                embeds: [embed]
            });
        }

        // AVATAR
        if (commandName === 'avatar') {

            const user =
                options.getUser('user') ||
                interaction.user;

            const embed = new EmbedBuilder()
                .setTitle(`${user.tag} Avatar`)
                .setImage(
                    user.displayAvatarURL({
                        dynamic: true,
                        size: 4096
                    })
                )
                .setColor('#5865F2');

            return interaction.reply({
                embeds: [embed]
            });
        }

        // COINFLIP
        if (commandName === 'coinflip') {

            const result =
                Math.random() > 0.5
                    ? 'Heads'
                    : 'Tails';

            return interaction.reply(
                `🪙 ${result}`
            );
        }

        // DICE
        if (commandName === 'dice') {

            const result =
                Math.floor(Math.random() * 6) + 1;

            return interaction.reply(
                `🎲 ${result}`
            );
        }

        // 8BALL
        if (commandName === '8ball') {

            const answers = [
                'Yes',
                'No',
                'Maybe',
                'Definitely',
                'Probably',
                'Never'
            ];

            const random =
                answers[
                    Math.floor(
                        Math.random() * answers.length
                    )
                ];

            return interaction.reply(
                `🎱 ${random}`
            );
        }

        // MEME
        if (commandName === 'meme') {

            const response = await axios.get(
                'https://meme-api.com/gimme'
            );

            const embed = new EmbedBuilder()
                .setTitle(response.data.title)
                .setImage(response.data.url)
                .setColor('#5865F2');

            return interaction.reply({
                embeds: [embed]
            });
        }

    } catch (err) {

        console.error(err);

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            return interaction.followUp({
                content: '❌ Error executing command',
                ephemeral: true
            });
        }

        return interaction.reply({
            content: '❌ Error executing command',
            ephemeral: true
        });
    }
});

process.on(
    'unhandledRejection',
    console.error
);

process.on(
    'uncaughtException',
    console.error
);

client.login(TOKEN);
