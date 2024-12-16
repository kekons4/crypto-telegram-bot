const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const path = require("path");

// User Defined modules and configs
const {adminCommands} = require('./src/utils/adminCommands');
const {memberCommands} = require('./src/utils/memberCommands');
const env = require("./src/assets/env.json");

// Add you botfather api token into .env
const token = env.BOTFATHERAPITOKEN;

// const targetChatId = 'YOUR_CHAT_ID'; // Replace with the actual chat ID

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log("CryptoliticsBot Online");

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (data === 'ca') {
        bot.sendMessage(message.chat.id, env.CA);
    } else if (data === 'learn') {
        const msg = {text: "/learn"};
        memberCommands(msg, message.chat.id, bot);
    } else if (data === 'closeMenu') {
         // Delete the previous message
         bot.deleteMessage(message.chat.id, message.message_id)
            .then(() => {
                console.log(`Bot deleted message successfully | chatId: ${message.chat.id} | messageId: ${message.message_id}`);
            })
            .catch((err) => {
                console.error(`Failed to delete message | chatId: ${message.chat.id} | messageId: ${message.message_id} | ERROR: `, err);
            });
    } else if(data === "nothing") {
        console.log("Do nothing...");
    } else {
        bot.sendMessage(message.chat.id, "Coming soon!");
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if the message is in a group or supergroup
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        try {
            // Get the user's role in the group
            const memberInfo = await bot.getChatMember(chatId, userId);
            const userRole = memberInfo.status; // Possible values: "creator", "administrator", "member", "restricted", "left", "kicked"

            if (userRole === 'creator' || userRole === 'administrator' || userRole === 'Sythographer') {
                // bot.sendMessage(chatId, `Hello Admin, ${msg.from.first_name}!`);
                memberCommands(msg, chatId, bot);
                adminCommands(msg, chatId, bot);
            } else if (userRole === 'Bot'){
                memberCommands(msg, chatId, bot);
            } else if (userRole === 'member') {
                // bot.sendMessage(chatId, `Hi ${msg.from.first_name}, you’re a member of this group.`);
                memberCommands(msg, chatId, bot);
            } else {
                // bot.sendMessage(chatId, `Sorry ${msg.from.first_name}, you don’t have permission to use this command.`);
                memberCommands(msg, chatId, bot);
            }
        } catch (error) {
            console.error('Error fetching chat member info:', error);
            bot.sendMessage(chatId, 'You do not have Sufficient Permissions to run this Command');
        }
    }
});

// Listen for new chat members
bot.on('new_chat_members', (msg) => {
    // Get the group chat ID
    const chatId = msg.chat.id;

    // Loop through all new members (in case multiple users join simultaneously)
    msg.new_chat_members.forEach((newMember) => {
        // Get the new member's first name
        const firstName = newMember.first_name || 'NULL';
        const lastName = newMember.last_name || '';

        // Customize your welcome message
        const welcomeMessage = `Welcome ${firstName} ${lastName} to Big Pharmai! 🎉`;

        // Send the welcome message
        bot.sendMessage(chatId, welcomeMessage);
    });
});

// Schedule the task to run every X amount of seconds if FETCHDEX is true
// if(env.FETCHDEX === true) intervalId = setInterval(periodicTask, env.periodicInterval * 1000);