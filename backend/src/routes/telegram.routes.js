const express = require("express");
const { webhook, telegramLogin, subscribe, mySubscriptions, unsubscribe } = require("../controllers/telegram.controller");
const { attachUser, requireAuth } = require("../middleware/auth");

const router = express.Router();

// Webhook - Telegram serveridan keladi (authsiz)
router.post("/webhook", webhook);
router.post("/login", telegramLogin);

router.post("/subscribe", attachUser, requireAuth, subscribe);
router.get("/subscriptions", attachUser, requireAuth, mySubscriptions);
router.delete("/subscribe/:id", attachUser, requireAuth, unsubscribe);

module.exports = router;
