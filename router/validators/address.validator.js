const { body } = require('express-validator');
const addressValidator = {
    address: [
        body("addressLine1").isString().withMessage("addressLine1 must be string"),
        body("addressLine2").optional({ checkFalsy: true }).isString().withMessage("addressLine2 must be string"),
        body("city").optional({ checkFalsy: true }).isString().withMessage("city must be string"),
        body("mobileNumber").optional({ checkFalsy: true }).isString().withMessage("mobileNumber must be string"),
        body("name").optional({ checkFalsy: true }).isString().withMessage("name must be string"),
        body("zipCode").optional({ checkFalsy: true }).isString().withMessage("zipCode must be string"),
        body("country").optional({ checkFalsy: true }).isString().withMessage("countryName must be string"),
        body("state").optional({ checkFalsy: true }).isString().withMessage("stateName must be string"),

    ]
}
module.exports.addressValidator = addressValidator