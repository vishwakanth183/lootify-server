const express = require("express");
const router = express.Router();

// required imports
const { SignUp, SignIn } = require("../../controller/user/user.controller");
const authValidator = require("../validators/auth.validator").authValidator;
const validator = require("../../middleware/validate.schema");

// routes
router.post("/signup", authValidator.signup, validator.validate, SignUp);
router.get("/signin", authValidator.signin, validator.validate, SignIn);

module.exports = router;
