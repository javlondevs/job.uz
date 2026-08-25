// Telegram long-polling - lokal ishlab chiqish uchun webhook o'rniga.
// Internetga ochiq URL bo'lmaganda localhost webhook qabul qila olmaydi,
// shuning uchun bot update'larni o'zi olib keladi (getUpdates).
const axios = require("axios");
const { handleUpdate } = require("./telegram.service");

let running = false;

async function startPolling() {
  if (running) return;
  running = true;

  const api = axios.create({
    baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`,
    timeout: 45000, // long-polling timeoutidan katta
  });

  console.log("🔄 Telegram polling rejimi yoqildi (lokal)");

  // Webhook mavjud bo'lsa getUpdates 409 qaytaradi - avval o'chiramiz
  try {
    await api.post("/deleteWebhook");
  } catch {}

  let offset = 0;

  while (running) {
    try {
      const { data } = await api.post("/getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message", "callback_query"],
      });
      if (data.ok) {
        for (const upd of data.result) {
          offset = Math.max(offset, upd.update_id + 1);
          try {
            await handleUpdate(upd);
          } catch (e) {
            console.error("Telegram update xatosi:", e.message);
          }
        }
      }
    } catch (e) {
      console.error("Polling xatosi:", e.response?.data?.description || e.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

function stopPolling() {
  running = false;
}

module.exports = { startPolling, stopPolling };
