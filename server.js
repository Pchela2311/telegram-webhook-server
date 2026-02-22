// Более безопасный вариант вебхука: /webhook/<secret>
// Если хотите так сделать, раскомментируйте этот блок и удалите app.post("/webhook"...)
/*
app.post("/webhook/:secret", async (req, res) => {
  res.sendStatus(200);

  try {
    if (!TELEGRAM_WEBHOOK_SECRET || req.params.secret !== TELEGRAM_WEBHOOK_SECRET) {
      return;
    }

    const update = req.body;

    const userText = getTextFromUpdate(update);
    const chatId = getChatIdFromUpdate(update);

    if (!userText || !chatId) return;
    if (!isPrivateChat(update)) return;

    if (userText === "/start") {
      await tgSendMessage(
        chatId,
        "Готово. Просто напишите задачу текстом, я отвечу. Команды: /help"
      );
      return;
    }

    if (userText === "/help") {
      await tgSendMessage(chatId, "Команды:\n/start\n/help\n\nПросто напишите задачу текстом.");
      return;
    }

    const answer = await callClaude(userText);
    await tgSendMessage(chatId, answer);

    if (CHANNEL_ID) {
      const channelPost = Задача: ${userText}\n\nРезультат:\n${answer}.slice(0, 3800);
      await tgSendMessage(CHANNEL_ID, channelPost);
    }
  } catch (e) {
    console.error(e);
  }
});
*/

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
