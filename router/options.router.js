const express = require("express");
const router = express.Router();

// required imports
const validator = require("../middleware/validate.schema");
const { createOption, getOptionsList, updateOption } = require("../controller/options.controller");

// routes
router.post("/createOption", createOption);
router.post("/updateOption", updateOption);
router.get("/getOptionsList", getOptionsList);

module.exports = router;
