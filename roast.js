const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// Your bot token and group ID
const TOKEN = '8262576157:AAGazKtmQOJ8OPaVBEjFKoEpI5KNFxFhdO4';
const GROUP_ID = -1002914341678;

// Create bot instance
const bot = new TelegramBot(TOKEN);

// Webhook for Render
app.use(express.json());
app.post(`/webhook/${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Set webhook on Render
  const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook/${TOKEN}`;
  bot.setWebHook(webhookUrl)
    .then(() => console.log('Webhook set to:', webhookUrl))
    .catch(console.error);
});

// Log function to send messages to your group
function sendLog(message) {
  bot.sendMessage(GROUP_ID, message)
    .catch(error => console.error('Error sending log:', error));
}

// Roast messages database
const roasts = [
  "If laughter is the best medicine, your face must be curing the world.",
  "You bring everyone so much joy... when you leave the room.",
  "I'd agree with you but then we'd both be wrong.",
  "You're the reason the gene pool needs a lifeguard.",
  "I'd explain it to you but I don't have any crayons with me.",
  "Your secrets are always safe with me. I never even listen when you tell me them.",
  "You have a face for radio... and a voice for silent film.",
  "I'd give you a nasty look but you've already got one.",
  "You're not pretty enough to be this stupid.",
  "If I wanted to kill myself I'd climb your ego and jump to your IQ.",
  "It's better to let someone think you're an idiot than to open your mouth and prove it.",
  "You have two brain cells and they're both fighting for third place.",
  "I've seen people like you before, but I had to pay admission.",
  "You're like a cloud. When you disappear, it's a beautiful day.",
  "I don't know what your problem is, but I'll bet it's hard to pronounce."
];

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  const welcomeMessage = `Hey ${userName}! Ready to get roasted? 😈`;
  
  // Create inline keyboard
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Roast Me! 🔥', callback_data: 'roast_me' }],
      [{ text: 'Add Your Own Roast ✏️', callback_data: 'add_roast' }]
    ]
  };
  
  bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard
  });
  
  // Send log
  sendLog(`🤖 User ${userName} (${msg.from.id}) started the bot`);
});

// Handle callback queries (button presses)
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;
  const userName = callbackQuery.from.first_name;
  
  if (data === 'roast_me') {
    // Get random roast
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    
    // Create inline keyboard for another roast
    const keyboard = {
      inline_keyboard: [
        [{ text: 'Another One! 🔥', callback_data: 'roast_me' }],
        [{ text: 'Add Your Own Roast ✏️', callback_data: 'add_roast' }]
      ]
    };
    
    bot.sendMessage(chatId, randomRoast, {
      reply_markup: keyboard
    });
    
    // Send log
    sendLog(`🔥 User ${userName} got roasted: "${randomRoast}"`);
    
    // Answer callback query
    bot.answerCallbackQuery(callbackQuery.id);
  } 
  else if (data === 'add_roast') {
    bot.sendMessage(chatId, "Send me your roast suggestion and I'll consider adding it to my collection! 😈");
    
    // Send log
    sendLog(`✏️ User ${userName} wants to add a roast`);
    
    // Answer callback query
    bot.answerCallbackQuery(callbackQuery.id);
  }
});

// Handle text messages for roast suggestions
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userName = msg.from.first_name;
  
  // Ignore commands and callback queries
  if (msg.text && !msg.text.startsWith('/')) {
    // Check if it's likely a roast suggestion (not a response to other messages)
    if (!msg.reply_to_message) {
      bot.sendMessage(chatId, "Thanks for your suggestion! I'll review it and might add it to my roast collection. 😈");
      
      // Send log
      sendLog(`💡 User ${userName} suggested a roast: "${text}"`);
    }
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
  sendLog(`❌ Bot error: ${error.message}`);
});

// Log when bot is ready
sendLog('🤖 Roast Bot is now running!');
