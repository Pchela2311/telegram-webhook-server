const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  console.log('Update received:', req.body);

  const message = req.body.message;

  if (message && message.text) {
    const chatId = message.chat.id;

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 500,
  messages: [
    { role: "user", content: message.text }
  ],
});

const aiText = response.content[0].text;

await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text: aiText,
  }),
});
      })
    });
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
