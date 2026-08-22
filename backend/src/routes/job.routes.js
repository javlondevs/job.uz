const express = require("express");
const { listJobs, getJob, createJob, updateJob, deleteJob, myJobs } = require("../controllers/job.controller");
const { attachUser, requireAuth, requireEmployer } = require("../middleware/auth");

const router = express.Router();

router.get("/", attachUser, listJobs);
router.get("/my", attachUser, requireAuth, requireEmployer, myJobs);
router.get("/:id", attachUser, getJob);
router.post("/", attachUser, requireEmployer, createJob);
router.put("/:id", attachUser, requireEmployer, updateJob);
router.delete("/:id", attachUser, requireEmployer, deleteJob);

module.exports = router;
