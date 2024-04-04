const express = require("express");
const { applyCoupon, updateOrder, cancelOrder, createNewOrder, getOrderList } = require("../../controller/orders/orders.controller");
const router = express.Router();

// routes
router.post("/applyCoupon", applyCoupon);
router.post("/createOrder", createNewOrder);
router.post("/updateOrder", updateOrder);
router.post("/cancelOrder", cancelOrder);
router.get("/getOrderList", getOrderList);

module.exports = router;
