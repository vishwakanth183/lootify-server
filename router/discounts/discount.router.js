const express = require("express");
const { getDiscountList, addDiscount, editDiscount, deleteDiscount } = require("../../controller/discounts/discountController");
const router = express.Router();

// required imports

// routes
router.get("/discountList", getDiscountList);
router.post("/add", addDiscount);
router.post("/edit", editDiscount);
router.post("/delete", deleteDiscount);

module.exports = router;
