const express = require("express");
const { getCustomerList, addCustomer, editCustomer, deleteCustomer, getCustomerDetails } = require("../../controller/customer/customer.controller");
const router = express.Router();

// required imports

// routes
router.get("/customerList", getCustomerList);
router.get("/getCustomerDetails", getCustomerDetails);
router.post("/add", addCustomer);
router.post("/edit", editCustomer);
router.post("/delete", deleteCustomer);

module.exports = router;
