const express = require("express");
const router = express.Router();

// required imports
const { addAddress } = require("../../controller/address/address.controller");
const addressValidator = require("../validators/address.validator").addressValidator;
const validator = require("../../middleware/validate.schema");

// routes
router.post("/add", addressValidator.address, validator.validate, addAddress);

module.exports = router;
