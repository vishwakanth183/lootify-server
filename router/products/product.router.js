const express = require("express");
const router = express.Router();

// required imports
const { addProduct, updateProduct, getProductDetail, getProductList, deleteProduct } = require("../../controller/products/productController");

// routes
router.post("/add", addProduct);
router.post("/update", updateProduct);
router.get("/getProductDetailById", getProductDetail);
router.get("/getProductList", getProductList);
router.post("/delete",deleteProduct)

module.exports = router;
