const express = require("express");
const { apply, myApplications, jobApplications, updateStatus } = require("../controllers/application.controller");
const { attachUser, requireAuth, requireEmployer } = require("../middleware/auth");

const router = express.Router();

router.post("/", attachUser, requireAuth, apply);
router.get("/mine", attachUser, requireAuth, myApplications);
router.get("/job/:jobId", attachUser, requireEmployer, jobApplications);
router.put("/:id/status", attachUser, requireEmployer, updateStatus);

module.exports = router;
