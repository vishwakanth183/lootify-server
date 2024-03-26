const { body } = require('express-validator');
const authValidator = {
    signup: [
        body('email').isEmail().withMessage("provide valid email id"),
        body('firstName').isString().withMessage('firstName must be string'),

    ],
    signin: [
        body('email').isEmail().withMessage("provide valid email id"),
        body('password').isString().withMessage('password must be string'),

    ]
}
module.exports.authValidator = authValidator