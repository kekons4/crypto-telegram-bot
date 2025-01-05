const fs = require('fs');
const path = require('path');
const env = require("../assets/env.json");

let intervalId = null;
let botty = null;

// Function to perform the task
const periodicTask = async () => {
    const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/solana/7FxfCMQBX9NmLEzppE3sSFYJJFSrtAdBjMYqQFwx7wNh', {
        method: 'GET',
        headers: {},
    });
    const data = await response.json();
    const { priceUsd, priceNative, marketCap } = data.pair;
    const message = `
<b>Big Pharmai💊</b>
<b>Market Cap: </b> ${marketCap}
<b>Price USD: </b>${priceUsd}
<b>Price Native: </b>${priceNative}
    `;
    // console.log(data.pair);
    botty.sendMessage(env.chatId, message, { parse_mode: 'HTML' }).catch((error) => {
        console.error('Error sending scheduled message:', error);
    });
};

function adminCommands(msg, groupProfile, bot) {
    const chatId = groupProfile.chatId;
    botty = bot;
    const cmd = msg.text === undefined ? "ERROR" : msg.text.split(" ")[0];
    const message = msg.text === undefined ? "ERROR" : msg.text.split(" ")[1];

    switch(cmd) {
        case "/setca":
            groupProfile.CA = message;
            fs.writeFileSync(path.join(process.cwd(), `src/database/${groupProfile.chatId}.json`), JSON.stringify(groupProfile));
            bot.sendMessage(chatId, `CA has been set to: ${message}`);
            break;
        case "/setwebsite":
            groupProfile.WEBSITE = message;
            fs.writeFileSync(path.join(process.cwd(), `src/database/${groupProfile.chatId}.json`), JSON.stringify(groupProfile));
            bot.sendMessage(chatId, `Website has been updated to ${groupProfile.WEBSITE}`);
            break;
        case "/interval":
            if(message === "stop") {
                if(intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                    bot.sendMessage(chatId, "Dexscreener fetch invertal has Stopped");
                } else {
                    bot.sendMessage(chatId, "Dexscreener fetch is not running at the moment");
                }
            } else if(message === "set") {
                const seconds = msg.text.split(" ")[2] === undefined ? 300 : Number(msg.text.split(" ")[2]);
                groupProfile.periodicInterval = seconds;
                fs.writeFileSync(path.join(process.cwd(), `src/database/${groupProfile.chatId}.json`), JSON.stringify(groupProfile));

                // clear current interval and restart with new interval and time
                if(intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = setInterval(periodicTask, groupProfile.periodicInterval * 1000);
                    bot.sendMessage(chatId, `Restarting Periodic Dexscreener fetch to: ${groupProfile.periodicInterval} seconds`);
                } else {
                    bot.sendMessage(chatId, `Periodic Dexscreener fetch interval set: ${groupProfile.periodicInterval}`);
                }
            } else if(message === "start") {
                if(intervalId === null) {
                    intervalId = setInterval(periodicTask, groupProfile.periodicInterval * 1000);
                    bot.sendMessage(chatId, `Dexscreener will fetch data every ${groupProfile.periodicInterval} seconds now`);
                } else {
                    bot.sendMessage(chatId, "Dexscreener fetch is already running!");
                }
            } else if(message === "status") {
                if(intervalId === null) bot.sendMessage(chatId, "Dexscreener fetch is OFFLINE");
                else bot.sendMessage(chatId, `Dexscreener fetching every ${groupProfile.periodicInterval} seconds`);
            } else {
                bot.sendMessage(chatId, `The /interval ${message} command does not exist...`);
            }
            break;
        case "ERROR":
            console.log("Non-standard message was sent");
            break;
    }
}

module.exports = {adminCommands};