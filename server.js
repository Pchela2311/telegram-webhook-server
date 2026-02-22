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
        text: "Я получил: " + message.text
      })
    });
  }

  res.sendStatus(200);
});
