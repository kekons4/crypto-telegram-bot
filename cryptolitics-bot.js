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
    const groupFile = fs.readFileSync(path.join(process.cwd(), `src/database/${message.chat.id}.json`));
    const groupProfile = JSON.parse(groupFile);

    if (data === 'ca') {
        bot.sendMessage(groupProfile.chatId, groupProfile.CA);
    } else if (data === 'learn') {
        const msg = {text: "/learn"};
        memberCommands(msg, groupProfile, bot);
    } else if (data === 'closeMenu') {
         // Delete the previous message
         bot.deleteMessage(groupProfile.chatId, message.message_id)
            .then(() => {
                console.log(`Bot deleted message successfully | chatId: ${groupProfile.chatId} | messageId: ${message.message_id}`);
            })
            .catch((err) => {
                console.error(`Failed to delete message | chatId: ${groupProfile.chatId} | messageId: ${message.message_id} | ERROR: `, err);
            });
    } else if(data === "nothing") {
        console.log("Do nothing...");
    } else {
        bot.sendMessage(groupProfile.chatId, "Coming soon!");
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if chatId profile already exists in database or not
    const inDB = fs.existsSync(path.join(process.cwd(), `src/database/${chatId}.json`));
    if(!inDB) {
        console.log(`Added to a new Group! | chatId: ${chatId} | Timestamp: ${Date.now()}`);
        const groupTemplate = {
            "chatId": chatId,
            "periodicInterval": 300,
            "CA": "/setca XXXXXXXXX",
            "LEARN": "/setlearn YOUR MISSON STATEMENT HERE",
            "XPROFILE": "https://x.com/elonmusk",
            "WEBSITE": "https://yourwebsite.com",
            "DEXSCREENER": "/setdex https://dexscreener.com/solana/7fxfcmqbx9nmlezppe3ssfyjjfsrtadbjmyqqfwx7wnh",
            "groupName": "/setname YOUR GROUP NAME",
            "FETCHDEX": false
        }

        fs.writeFileSync(path.join(process.cwd(), `src/database/${chatId}.json`), JSON.stringify(groupTemplate));
        const isCreated = fs.existsSync(path.join(process.cwd(), `src/database/${chatId}.json`));

        if(!isCreated) {
            console.log(`Something went wrong with creating a new group chatId: ${chatId}`);
        } else {
            // UPDATE just added to new group message
            bot.sendMessage(chatId, "Hello I am Cryptolitics bot. I can help with setting up a Memecoin based Telegram chat. To get started type /setup");
        }
    }

    // Check if the message is in a group or supergroup
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        const groupFile = fs.readFileSync(path.join(process.cwd(), `src/database/${chatId}.json`));
        const groupProfile = JSON.parse(groupFile);

        try {
            // Get the user's role in the group
            const memberInfo = await bot.getChatMember(chatId, userId);
            const userRole = memberInfo.status; // Possible values: "creator", "administrator", "member", "restricted", "left", "kicked"

            if (userRole === 'creator' || userRole === 'administrator' || userRole === 'Synthographer') {
                // bot.sendMessage(chatId, `Hello Admin, ${msg.from.first_name}!`);
                memberCommands(msg, groupProfile, bot);
                adminCommands(msg, groupProfile, bot);
            } else if (userRole === 'Bot'){
                memberCommands(msg, groupProfile, bot);
            } else if (userRole === 'member') {
                // bot.sendMessage(groupProfile, `Hi ${msg.from.first_name}, you’re a member of this group.`);
                memberCommands(msg, groupProfile, bot);
            } else {
                // bot.sendMessage(groupProfile, `Sorry ${msg.from.first_name}, you don’t have permission to use this command.`);
                memberCommands(msg, groupProfile, bot);
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
        const welcomeMessage = `Welcome ${firstName} to ${env.GROUPNAME}! 🎉`;

        // Send the welcome message
        bot.sendMessage(chatId, welcomeMessage);
    });
});

bot.on('error', (err) => console.error('Bot Error:', err));
bot.on('polling_error', (err) => console.error('Polling Error:', err));

// Schedule the task to run every X amount of seconds if FETCHDEX is true
// if(env.FETCHDEX === true) intervalId = setInterval(periodicTask, env.periodicInterval * 1000);