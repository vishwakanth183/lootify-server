const express = require("express");
const router = express.Router();

// required imports
const { addProduct, updateProduct, getProductDetail, getProductList } = require("../../controller/products/productController");

// routes
router.post("/add", addProduct);
router.post("/update", updateProduct);
router.get("/getProductDetailById", getProductDetail);
router.get("/getProductList", getProductList);

module.exports = router;
