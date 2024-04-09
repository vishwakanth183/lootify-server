const express = require("express");
const { getDiscountList, addDiscount, editDiscount, deleteDiscount, getDiscountDetails } = require("../../controller/discounts/discountController");
const router = express.Router();

// required imports

// routes
router.get("/discountList", getDiscountList);
router.post("/add", addDiscount);
router.post("/edit", editDiscount);
router.post("/delete", deleteDiscount);
router.get("/getDiscountDetails", getDiscountDetails);

module.exports = router;
