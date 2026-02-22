"use strict";

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json({ limit: "1mb" }));

const BOT_TOKEN = process.env.BOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Канал, куда постить результаты (опционально)
// Пример: -1001234567890
const CHANNEL_ID = process.env.CHANNEL_ID || "";

// По умолчанию — платная Opus 4.6
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-6";

if (!BOT_TOKEN) throw new Error("BOT_TOKEN is missing");
if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is missing");

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

async function tgSendMessage(chatId, text, opts = {}) {
  const url = https://api.telegram.org/bot${BOT_TOKEN}/sendMessage;
  const payload = {
    chat_id: chatId,
    text,
    ...opts,
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.ok === false) {
    const errText = data?.description || HTTP ${r.status};
    throw new Error(`Telegram sendMessage failed: ${errText}`);
  }
  return data;
}

function normalizeUserText(update) {
  // обычные сообщения
  if (update?.message?.text) return update.message.text;
  // сообщения из других источников (если нужно расширить позже)
  return "";
}

function getChatId(update) {
  return update?.message?.chat?.id || null;
}

function isPrivateChat(update) {
  return update?.message?.chat?.type === "private";
}

async function callClaude(userText) {
  // Ограничим длину запроса на всякий случай
  const trimmed = String(userText || "").trim().slice(0, 8000);
  if (!trimmed) return "Пустой запрос. Напишите текстом задачу.";

  const system =
    "Ты ассистент. Отвечай на русском. Давай результат сразу, без лишней воды. Если задача про контент — предложи структурированный результат.";

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    temperature: 0.6,
    system,
    messages: [{ role: "user", content: trimmed }],
  });

  // SDK возвращает массив content-блоков
  const text =
    resp?.content
      ?.filter((c) => c.type === "text")
      ?.map((c) => c.text)
      ?.join("\n")
      ?.trim() || "";

  return text || "Не удалось получить текстовый ответ от модели.";
}

app.get("/", (_req, res) => res.status(200).send("OK"));
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

app.post("/webhook", async (req, res) => {
  // Telegram ждёт быстрый 200 OK, поэтому отвечаем сразу,
  // а обработку делаем асинхронно.
  res.sendStatus(200);

  const update = req.body;

  try {
    const userText = normalizeUserText(update);
    const chatId = getChatId(update);

    if (!userText || !chatId) return;

    // Обрабатываем только личные сообщения (чтобы канал не триггерил сам себя)
    if (!isPrivateChat(update)) return;

    // Команды
    if (userText === "/start") {
      await tgSendMessage(
        chatId,
        "Отправьте задачу текстом. Я отвечу вам и (если настроен CHANNEL_ID) опубликую результат в канале."
      );
      return;
    }

    if (userText === "/help") {
      await tgSendMessage(
        chatId,
        "Команды:\n/start\n/help\n\nПросто напишите задачу текстом."
      );
      return;
    }

    // Основная логика: Claude -> ответ в чат -> пост в канал (если задан)
    const answer = await callClaude(userText);

    await tgSendMessage(chatId, answer);

    if (CHANNEL_ID) {
      // Важно: бот должен быть админом канала, иначе постить не сможет.
      const channelPost =
        Задача: ${userText}\n\nРезультат:\n${answer}.slice(0, 3800);

      await tgSendMessage(CHANNEL_ID, channelPost, {
        disable_web_page_preview: true,
      });
    }
  } catch (e) {
    // Пытаемся хотя бы сообщить пользователю (если есть chatId)
    try {
      const chatId = getChatId(req.body);
      if (chatId) {
        await tgSendMessage(chatId, `Ошибка: ${e.message}`);
      }
      } catch (_) {}
    console.error(e);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
