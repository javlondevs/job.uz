const express = require("express");
const { listCompanies, getCompany, createCompany, updateCompany } = require("../controllers/company.controller");
const { attachUser, requireAuth, requireEmployer } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listCompanies);
router.get("/:id", getCompany);
router.post("/", attachUser, requireEmployer, upload.single("logo"), createCompany);
router.put("/:id", attachUser, requireEmployer, upload.single("logo"), updateCompany);

module.exports = router;
