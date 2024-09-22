const TelegramBot = require('node-telegram-bot-api');
const token = '7851980068:AAHGDs_mWVq2LVbDk2kIzwtPxJPgq9GJ3NE'; 
const bot = new TelegramBot(token, { polling: true });

const userPoints = {}; 

console.log('Bot is ready.. >');

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

 
    if (!msg.text || !msg.from || !msg.chat.type) {
        console.log('Received a non-text message or an update without text.');
        return; 
    }

    const messageText = msg.text;
    const userId = msg.from.id; 
    const username = msg.from.username ? msg.from.username.replace('@', '') : userId; 

    console.log('Received message: ', messageText);


    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        if (messageText.startsWith('!chaos_give')) {

            const chatMember = await bot.getChatMember(chatId, userId);
            if (chatMember.status !== 'administrator' && chatMember.status !== 'creator') {
                bot.sendMessage(chatId, 'Only admins can award chaos points!');
                return;
            }

            const parts = messageText.split(' ');
            const recipientUsername = parts[1]?.replace('@', ''); 
            const points = parseFloat(parts[2]);

            if (isNaN(points)) {
                bot.sendMessage(chatId, 'Please provide a valid number of points.');
                return;
            }

            if (points > 10000) {
                bot.sendMessage(chatId, 'Maximal chaos reward is 10000!');
                return;
            } else if (points < 0) {
                bot.sendMessage(chatId, 'You cannot award negative points!');
                return;
            }


            if (recipientUsername === 'chaoscatbot') { 
                bot.sendMessage(chatId, 'You cannot award points to the bot.');
                return;
            }

   
            if (!userPoints[recipientUsername]) {
                userPoints[recipientUsername] = 0; 
            }

            userPoints[recipientUsername] += points;
            bot.sendMessage(chatId, `${recipientUsername} just copped ${points} chaos points!`);
        } else if (messageText.startsWith('!chaos')) {

            if (userPoints[username]) {
                bot.sendMessage(chatId, `You have ${userPoints[username]} chaos points.`);
            } else {
                bot.sendMessage(chatId, 'You have 0 chaos points.');
            }
        } else if (messageText.startsWith('!leaderboard')) {

            const sortedUsers = Object.entries(userPoints)
                .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
                .slice(0, 10); 


            let leaderboardMessage = '🏆 Chaos Leaderboard 🏆\n \n';
            if (sortedUsers.length === 0) {
                leaderboardMessage += 'No users have points yet.';
            } else {
                sortedUsers.forEach(([username, points], index) => {
                    leaderboardMessage += `${index + 1}. @${username}: ${points} points\n`;
                });
            }

            bot.sendMessage(chatId, leaderboardMessage);
        }
    }
});
