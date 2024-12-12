const TelegramBot = require('node-telegram-bot-api');
const WebSocket = require('ws');
const fs = require("fs");
const path = require("path");

// User Defined modules and files
const env = require("./env.json");

// Add you botfather api token into .env
const token = env.BOTFATHERAPITOKEN;

// const targetChatId = 'YOUR_CHAT_ID'; // Replace with the actual chat ID

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log("CryptoliticsBot Online");

// const ws = new WebSocket('wss://pumpportal.fun/api/data');

// ws.on('open', function open() {

//     // Subscribing to token creation events
//     let payload = {
//         method: "subscribeNewToken", 
//       }
//     ws.send(JSON.stringify(payload));
  
//     // // Subscribing to trades made by accounts
//     payload = {
//         method: "subscribeAccountTrade",
//         keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV", "HUrbfZsYMKsZhSSNZsSwWJwFz1WKNU8yfB7PcbgKrsAx", "Gjs1n3tCSqyia4PbH3hyzb8XnkiqaqTtVEo9cnropvn"] // array of accounts to watch
//       }
//     ws.send(JSON.stringify(payload));
  
//     // Subscribing to trades on tokens
//     payload = {
//         method: "subscribeTokenTrade",
//         keys: ["Bwc4EBE65qXVzZ9ZiieBraj9GZL4Y2d7NN7B9pXENWR2"] // array of token CAs to watch
//     }
//     ws.send(JSON.stringify(payload));
//   });
  
//   ws.on('message', function message(data) {
//     console.log(JSON.parse(data));
//   });

// // Function to perform the task
const periodicTask = async () => {
    const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/solana/Bp7ryX5QQFJZrXPoaj5mhP3BjzpTxJUiBMjXaLJBLoga', {
        method: 'GET',
        headers: {},
    });
    const data = await response.json();
    const message = `${JSON.stringify(data)} | ${new Date().toLocaleTimeString()}`;
    console.log(message);
    // bot.sendMessage(targetChatId, message).catch((error) => {
    //     console.error('Error sending scheduled message:', error);
    // });
};

const commandCheck = (msg, chatId) => {
    switch(msg.text) {
        case "/kreios":
            bot.sendMessage(chatId, `This is a secret command... do not share`);
            break;
        case "/welcome":
            bot.sendMessage(chatId, `Welcome to the Big Pharmai ${msg.from.first_name}! Try /menu to start!`);
            break;
        case "/ca":
            bot.sendMessage(chatId, env.CA);
            break;
        case "/learn":
            bot.sendMessage(chatId, env.LEARN);
            break;
        case "/menu":
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Available Commands', callback_data: 'nothing' }
                        ],
                        [
                            { text: '👥Twitter/X', url: env.XPROFILE },
                            { text: '📜CA', callback_data: 'ca' },
                            { text: '📚Learn', callback_data: 'learn' }
                        ],
                        [
                            { text: '🕸Website', callback_data: 'website' },
                            { text: '📈Dexscreener', callback_data: "dexscreener" }
                        ],
                        [
                            { text: '❌Close', callback_data: 'closeMenu' }
                        ]
                    ]
                }
            };

            bot.sendMessage(chatId, "Menu", options);
            break;
    }
}

const adminCommands = (msg, chatId) => {
    const cmd = msg.text === undefined ? "ERROR" : msg.text.split(" ")[0];
    const message = msg.text === undefined ? "ERROR" : msg.text.split(" ")[1];


    switch(cmd) {
        case "/setca":
            env.CA = message;
            fs.writeFileSync(path.join(process.cwd(), "env.json"), JSON.stringify(env));
            bot.sendMessage(chatId, `CA has been set to: ${message}`);
            break;
        case "/setlearn":
            env.LEARN = message;
            fs.writeFileSync(path.join(process.cwd(), "env.json"), JSON.stringify(env));
            bot.sendMessage(chatId, `CA has been set to: ${message}`);
            break;
        case "/btn":
            // Define inline keyboard buttons
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '👥Twitter/X', url: env.XPROFILE },
                            { text: '📜CA', callback_data: 'ca' },
                            { text: '📚Learn', callback_data: 'learn' }
                        ],
                        [
                            { text: '❌Close', callback_data: 'closeMenu' }
                        ]
                    ]
                }
            };

            bot.sendMessage(chatId, 'Available Commands', options);
            break;
        case "ERROR":
            console.log("Non-standard message was sent");
            break;
    }
}

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (data === 'ca') {
        bot.sendMessage(message.chat.id, env.CA);
    } else if (data === 'learn') {
        bot.sendMessage(message.chat.id, env.LEARN);
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
                commandCheck(msg, chatId);
                adminCommands(msg, chatId);
            } else if (userRole === 'Bot'){
                commandCheck(msg, chatId);
            } else if (userRole === 'member') {
                // bot.sendMessage(chatId, `Hi ${msg.from.first_name}, you’re a member of this group.`);
                commandCheck(msg, chatId);
            } else {
                // bot.sendMessage(chatId, `Sorry ${msg.from.first_name}, you don’t have permission to use this command.`);
                commandCheck(msg, chatId);
            }
        } catch (error) {
            console.error('Error fetching chat member info:', error);
            bot.sendMessage(chatId, 'Unable to determine your permissions.');
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
        const welcomeMessage = `Welcome ${firstName} ${lastName} to Big Pharmai! 🎉 Try /menu to start!`;

        // Send the welcome message
        bot.sendMessage(chatId, welcomeMessage);
    });
});

// // Schedule the task to run every 10 seconds (60,000 milliseconds)
// setInterval(periodicTask, 10 * 1000);