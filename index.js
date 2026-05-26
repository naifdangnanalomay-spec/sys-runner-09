const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = 'MTUwNzAwNzA3MTYzNDMyOTcwMw.GUF6lE.xwjzyhs1mMcoDfE8o0CWI3-CY_az3kdxhZ4WWM'; // ← DITO ILALAGAY YUNG TOKEN MO

client.on('ready', () => {
    console.log(`✅ Nakabukas na ako bilang: ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('🏓 Pong! Gumagana ako nang maayos!');
    }
});

client.login(TOKEN);