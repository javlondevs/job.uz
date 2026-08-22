const express = require("express");
const { myCvs, getCv, createCv, updateCv, deleteCv } = require("../controllers/cv.controller");
const { attachUser, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", attachUser, requireAuth, myCvs);
router.get("/:id", attachUser, getCv);
router.post("/", attachUser, requireAuth, createCv);
router.put("/:id", attachUser, requireAuth, updateCv);
router.delete("/:id", attachUser, requireAuth, deleteCv);

module.exports = router;
