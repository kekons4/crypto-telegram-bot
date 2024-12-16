const fs = require('fs');
const path = require('path');
let env = require("../assets/env.json");

async function memberCommands(msg, chatId, bot) {
    // resync the env config
    // env = fs.readFileSync(path.join(process.cwd(), "src/assets/env.json"));

    switch(msg.text) {
        case "/kreios":
            bot.sendMessage(chatId, `You found Easter Egg #1 🐇`);
            break;
        case "/website":
            bot.sendMessage(chatId, `Website: ${env.WEBSITE}`);
            break;
        case "/welcome":
            bot.sendMessage(chatId, `Welcome to the Big Pharmai ${msg.from.first_name}!`);
            break;
        case "/ca":
            bot.sendMessage(chatId, env.CA);
            break;
        case "/learn":
            const formattedMessage = `
<b>Introducing Big Pharmai</b>: a community-led effort to flip Big Pharma.
We’re a group of biohackers led by @anthonyfauccai on a mission to unfuck drug discovery.

<b>2/</b> We've been biohacking since we were teenagers, running n=1 experiments from our bedrooms while Big Pharma was busy filing patents. They banned our favorite compounds, built their walls, and milked every last dollar in the process.

<b>3/</b> The system is broken. The drugs barely work and have tons of side effects. The whole industry is reactive. Big Pharma isn’t even trying to extend our healthspan, let alone lifespan. Promising compounds sit on shelves. Breakthrough research gathers dust. None of this has changed in decades.

<b>But it’s about to.</b>

We’re about to back the most impactful projects in <b>DeSci</b> and support them in every conceivable way. SITG: at <b>Big Pharmai</b>, we don't just buy and sell drugs, we try them ourselves.
            `;
            bot.sendMessage(chatId, formattedMessage, { parse_mode: 'HTML' });
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
                            { text: '🕸Website', url: env.WEBSITE },
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

module.exports = {memberCommands};