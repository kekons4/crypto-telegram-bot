const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config();

// Add you botfather api token into .env
const token = process.env.BOTFATHERAPITOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log("CryptoliticsBot Online");

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    switch(msg.text) {
        case "/kreios":
            bot.sendMessage(chatId, `This is a secret command... do not share`);
            break;
        case "/welcome":
            bot.sendMessage(chatId, `Welcome to the Cryptolitics ${msg.from.first_name}!`)
            break;
    }
});
