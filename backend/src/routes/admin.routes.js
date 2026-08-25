const express = require("express");
const { stats, listUsers, changeRole, deleteUser, listJobs, changeJobStatus, deleteJob, impersonateUser, listCompanies } = require("../controllers/admin.controller");
const { attachUser, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Barcha admin marshrutlari: login + ADMIN roli talab qilinadi
router.use(attachUser, requireAdmin);

router.get("/stats", stats);
router.get("/users", listUsers);
router.put("/users/:id/role", changeRole);
router.post("/users/:id/impersonate", impersonateUser);
router.delete("/users/:id", deleteUser);
router.get("/companies", listCompanies);
router.get("/jobs", listJobs);
router.put("/jobs/:id/status", changeJobStatus);
router.delete("/jobs/:id", deleteJob);

module.exports = router;
