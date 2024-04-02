const express = require("express");
const router = express.Router();

// required imports
const validator = require("../../middleware/validate.schema");
const { createOption, getOptionsList, updateOption, deleteOption, getOptionDetails } = require("../../controller/options/options.controller");

// routes
router.post("/createOption", createOption);
router.post("/updateOption", updateOption);
router.get("/getOptionsList", getOptionsList);
router.post("/deleteOption", deleteOption);
router.get("/getOptionDetails",getOptionDetails);

module.exports = router;
