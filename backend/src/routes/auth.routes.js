const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { attachUser, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", attachUser, requireAuth, me);

module.exports = router;
