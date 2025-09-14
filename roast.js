const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// Your bot token and group ID
const TOKEN = '8262576157:AAGazKtmQOJ8OPaVBEjFKoEpI5KNFxFhdO4';
const GROUP_ID = -1002914341678;

// Create bot instance
const bot = new TelegramBot(TOKEN);

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Roast Bot is running!');
});

// Webhook endpoint
app.post(`/webhook`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Set webhook on Render
  try {
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
    await bot.setWebHook(webhookUrl);
    console.log('Webhook set to:', webhookUrl);
    
    // Send startup message to log group
    await bot.sendMessage(GROUP_ID, '🤖 Roast Bot is now running on Render!');
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
});

// Log function
function sendLog(message) {
  bot.sendMessage(GROUP_ID, message)
    .catch(error => console.error('Error sending log:', error));
}

// Roast messages
const roasts = [
  "If laughter is the best medicine, your face must be curing the world.",
  "You bring everyone so much joy... when you leave the room.",
  "I'd agree with you but then we'd both be wrong.",
  "You're the reason the gene pool needs a lifeguard.",
  "I'd explain it to you but I don't have any crayons with me."
];

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Roast Me! 🔥', callback_data: 'roast_me' }],
      [{ text: 'About ℹ️', callback_data: 'about' }]
    ]
  };
  
  bot.sendMessage(chatId, `Hey ${userName}! Ready to get roasted? 😈`, {
    reply_markup: keyboard
  });
  
  sendLog(`🤖 User ${userName} started the bot`);
});

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;
  
  if (data === 'roast_me') {
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    bot.sendMessage(chatId, randomRoast);
    bot.answerCallbackQuery(callbackQuery.id);
  } 
  else if (data === 'about') {
    bot.sendMessage(chatId, "This is a Roast Bot created with Node.js and hosted on Render.");
    bot.answerCallbackQuery(callbackQuery.id);
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
  sendLog(`❌ Bot error: ${error.message}`);
});

console.log('Bot server initialized');
