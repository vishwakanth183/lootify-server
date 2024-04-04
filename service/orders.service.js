const db = require("../models");
const Orders = db.orders;
const CustomerDiscountMapping = db.customerDiscountMapping;
const Products = db.products;
const VariantCombinationDetails = db.variantCombinationDetails;

// Function used to create an order
const createOrder = async orderData => {
  try {
    await db.sequelize.transaction(async transact => {
      const orderDetail = await Orders.create(orderData, { transaction: transact });

      //   console.log("orderDetail", orderDetail.id);

      if (orderData.discountId) {
        await createUserDiscountMapping(orderData.discountId, orderDetail.id, orderData.customerId, transact);
      }

      const orderedProducts = orderData.orderedProducts;
      //   console.log("ordereProducts", orderedProducts);

      await Promise.all(
        orderedProducts.map(async currentProduct => {
          //   console.log("inside map", currentProduct.id);
          if (!currentProduct.isVariants) {
            await updateProductStock({ productId: currentProduct.id, action: "decrement", stockValue: currentProduct.quantity, transaction: transact });
          } else await updateVariantStock({ variantId: currentProduct.variantId, productId: currentProduct.id, action: "decrement", stockValue: currentProduct.quantity, transaction: transact });
        }),
      );

      return orderDetail;
    });
  } catch (err) {
    throw err;
  }
};

module.exports.createOrder = createOrder;

// Function used to create an user discount mapping
const createUserDiscountMapping = async (discountId, orderId, customerId, transact) => {
  await CustomerDiscountMapping.create({ discountId, orderId, customerId }, { transaction: transact });
};

// Function used to find and update product stock
const updateProductStock = async ({ productId, action, stockValue, transaction }) => {
  //   console.log("inside updateProductStock");
  const previousStock = await Products.findOne({
    where: {
      id: productId,
    },
  });
  if (!previousStock) throw new Error("Inavid product");
  // console.log("new stock ", parseFloat(previousStock.stock) - stockValue);
  if (action == "decrement") {
    await Products.update({ stock: parseFloat(previousStock.stock) - stockValue }, { where: { id: productId } }, { transaction: transaction });
  } else {
    // console.log("increment product Stock", parseFloat(previousStock.stock), stockValue, parseFloat(previousStock.stock) + stockValue);
    await Products.update({ stock: parseFloat(previousStock.stock) + stockValue }, { where: { id: productId } }, { transaction: transaction });
  }
};

// Function used to find and update variant stock
const updateVariantStock = async ({ productId, variantId, action, stockValue, transaction }) => {
  //   console.log("inside updateVariantStock");
  const previousVariantStock = await VariantCombinationDetails.findOne({
    where: {
      id: variantId,
      productId: productId,
    },
  });
  if (!previousVariantStock) throw new Error("Inavid product variant");
  //   console.log("new stock ", parseFloat(previousVariantStock.stock) - stockValue);
  if (action == "decrement") {
    await VariantCombinationDetails.update({ stock: parseFloat(previousVariantStock.stock) - stockValue }, { where: { id: variantId } }, { transaction: transaction });
  } else {
    // console.log("increment VariantStock", parseFloat(previousVariantStock.stock), stockValue, parseFloat(previousVariantStock.stock) + stockValue);
    await VariantCombinationDetails.update({ stock: parseFloat(previousVariantStock.stock) + stockValue }, { where: { id: variantId } }, { transaction: transaction });
  }
};

// Function to edit an order
const editOrderById = async orderData => {
  try {
    await db.sequelize.transaction(async transact => {
      const orderId = orderData.id;
      const currentOrderDetails = orderData;
      const previousOrderDetails = await getOrderDetailsById(orderId);

      // console.log("previousOrderDetails", previousOrderDetails, orderId);

      // Check whether discount is removed or not
      if (!currentOrderDetails?.discountId && previousOrderDetails?.customerDiscountMapping?.id) {
        await CustomerDiscountMapping.destroy({ where: { id: previousOrderDetails.customerDiscountMapping.id } }, { transaction: transact });
        // await CustomerDiscountMapping.destroy({ where: { discountId: previousOrderDetails.discountId, orderId: orderId, customerId: previousOrderDetails.customerId } }, { transaction: transact });
      }

      // console.log("previousOrderDetails.orderedProducts", previousOrderDetails.orderedProducts);
      // console.log("currentOrderDetails.orderedProducts", currentOrderDetails.orderedProducts);

      // Getting previous and current ordered products
      const previousProducts = previousOrderDetails.orderedProducts;
      const currentProducts = currentOrderDetails.orderedProducts;

      // Handling logic for existing and removed products
      for (let i = 0; i < previousProducts.length; i++) {
        let existingProduct;
        let productDetail = previousProducts[i];
        if (productDetail.isVariants) {
          existingProduct = currentProducts.find(item => item.id == productDetail.id && item.isVariants && item.variantId == productDetail.variantId);
        } else {
          existingProduct = currentProducts.find(item => item.id == productDetail.id);
        }
        // Handle update quanity for existing product
        if (existingProduct) {
          let newQuantity = existingProduct.quantity;
          let oldQuanity = productDetail.quantity;
          if (newQuantity != oldQuanity) {
            if (newQuantity < oldQuanity) {
              if (productDetail.isVariants) {
                //Handle increment quantity for variant product
                await updateVariantStock({ productId: productDetail.id, variantId: productDetail.variantId, action: "increment", stockValue: Math.abs(parseFloat(newQuantity) - parseFloat(oldQuanity)), transaction: transact });
              } else {
                //Handle increment quantity for variant product
                await updateProductStock({ productId: productDetail.id, action: "increment", stockValue: Math.abs(parseFloat(newQuantity) - parseFloat(oldQuanity)), transaction: transact });
              }
            } else {
              if (productDetail.isVariants) {
                //Handle decrement quantity for variant product
                await updateVariantStock({ productId: productDetail.id, variantId: productDetail.variantId, action: "decrement", stockValue: Math.abs(parseFloat(newQuantity) - parseFloat(oldQuanity)), transaction: transact });
              } else {
                //Handle decrement quantity for variant product
                await updateProductStock({ productId: productDetail.id, action: "decrement", stockValue: Math.abs(parseFloat(newQuantity) - parseFloat(oldQuanity)), transaction: transact });
              }
            }
          } else {
            // console.log("skip,this one have same quantity");
          }
        }
        // Handle update quanity for removed product
        else {
          if (productDetail.isVariants) {
            //Handle increment quantity for removed variant product
            await updateVariantStock({ productId: productDetail.id, variantId: productDetail.variantId, action: "increment", stockValue: productDetail.quantity, transaction: transact });
          } else {
            //Handle increment quantity for removed product
            await updateProductStock({ productId: productDetail.id, action: "increment", stockValue: productDetail.quantity, transaction: transact });
          }
        }
      }

      // Handling logic for newly added products
      for (let i = 0; i < currentProducts.length; i++) {
        // console.log("currentProducts[i].isVariants", currentProducts[i].isVariants);
        let productDetail;
        if (currentProducts[i].isVariants) {
          productDetail = previousProducts.find(item => item.id == currentProducts[i].id && item.variantId == currentProducts[i].variantId);
        } else {
          productDetail = previousProducts.find(item => item.id == currentProducts[i].id);
        }
        // console.log("productDetail", productDetail);

        if (!productDetail) {
          if (currentProducts[i].isVariants) {
            //Handle decrement quantity for variant product
            await updateVariantStock({ productId: currentProducts[i].id, variantId: currentProducts[i].variantId, action: "decrement", stockValue: parseFloat(currentProducts[i].quantity), transaction: transact });
          } else {
            //Handle decrement quantity for variant product
            await updateProductStock({ productId: currentProducts[i].id, action: "decrement", stockValue: parseFloat(currentProducts[i].quantity), transaction: transact });
          }
        }
      }

      // Function to update orderdetails
      const updatedOrder = await Orders.update(orderData, { where: { id: orderData.id } }, { transaction: transact });

      return updatedOrder;
    });
  } catch (err) {
    throw err;
  }
};

module.exports.editOrderById = editOrderById;

// Function to cancel an order
const cancelOrderById = async orderId => {
  try {
    await db.sequelize.transaction(async transact => {
      const orderDetails = await getOrderDetailsById(orderId);

      console.log("orderDetails customerDiscountMapping", orderDetails.customerDiscountMapping.id);

      if (orderDetails.isCancelled) {
        throw new Error("Order already cancelled");
      }
      const orderedProducts = orderDetails.orderedProducts;

      await Promise.all(
        orderedProducts.map(async currentProduct => {
          //   console.log("inside map", currentProduct.id);
          if (!currentProduct.isVariants) {
            await updateProductStock({ productId: currentProduct.id, action: "increment", stockValue: currentProduct.quantity, transaction: transact });
          } else await updateVariantStock({ variantId: currentProduct.variantId, productId: currentProduct.id, action: "increment", stockValue: currentProduct.quantity, transaction: transact });
        }),
      );

      // removed mapped discount for this order
      if (orderDetails.customerDiscountMapping.id) {
        await CustomerDiscountMapping.destroy({ where: { id: orderDetails.customerDiscountMapping.id } }, { transaction: transact });
      }

      const cacelOrderResponse = Orders.update({ isCancelled: true }, { where: { id: orderId } }, { transaction: transact });
      return cacelOrderResponse;
    });
  } catch (err) {
    throw err;
  }
};

// Function to get orderDetails by id
const getOrderDetailsById = async orderId => {
  return Orders.findByPk(orderId, { include: CustomerDiscountMapping });
};

module.exports.cancelOrderById = cancelOrderById;
