const TelegramBot = require('node-telegram-bot-api');
const WebSocket = require('ws');
require("dotenv").config();

// Add you botfather api token into .env
const token = process.env.BOTFATHERAPITOKEN;
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

// // Schedule the task to run every 10 seconds (60,000 milliseconds)
setInterval(periodicTask, 10 * 1000);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if the message is in a group or supergroup
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        try {
            // Get the user's role in the group
            const memberInfo = await bot.getChatMember(chatId, userId);
            const userRole = memberInfo.status; // Possible values: "creator", "administrator", "member", "restricted", "left", "kicked"

            if (userRole === 'creator' || userRole === 'administrator') {
                bot.sendMessage(chatId, `Hello Admin, ${msg.from.first_name}!`);
            } else if (userRole === 'member') {
                bot.sendMessage(chatId, `Hi ${msg.from.first_name}, you’re a member of this group.`);
            } else {
                bot.sendMessage(chatId, `Sorry ${msg.from.first_name}, you don’t have permission to use this command.`);
            }
        } catch (error) {
            console.error('Error fetching chat member info:', error);
            bot.sendMessage(chatId, 'Unable to determine your permissions.');
        }
    }

    // switch(msg.text) {
    //     case "/kreios":
    //         bot.sendMessage(chatId, `This is a secret command... do not share`);
    //         break;
    //     case "/welcome":
    //         bot.sendMessage(chatId, `Welcome to the Cryptolitics ${msg.from.first_name}!`)
    //         break;
    // }
});


