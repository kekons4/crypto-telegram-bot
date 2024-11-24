const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TOKEN_HERE' with your actual bot token from BotFather
const token = 'YOUR_TOKEN_HERE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any messages and respond with "Hello!"
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Send a message back to the chat
    bot.sendMessage(chatId, `Hello, ${msg.from.first_name}! How can I assist you?`);
});
