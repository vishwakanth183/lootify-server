const db = require("../../models");
const { createOrder, cancelOrderById, editOrderById } = require("../../service/orders.service");
const Discounts = db.discounts;
const CustomerDiscountMapping = db.customerDiscountMapping;
const Orders = db.orders;

// Function to apply a coupon
const applyCoupon = async (req, res) => {
  try {
    const promoCode = req.body.promoCode;
    const appliedDiscount = await Discounts.findOne({
      where: {
        promoCode: promoCode,
      },
    });
    if (!appliedDiscount) throw new Error("Invalid coupon code");
    const previousUsageByUser = await CustomerDiscountMapping.findAll({ where: { discountId: appliedDiscount.id } });
    // console.log("appliedDiscount.usageLimitPerCustomer", appliedDiscount.usageLimitPerCustomer);
    // console.log("previousUsageByUser.length", previousUsageByUser);
    if (!appliedDiscount.usageLimitPerCustomer || previousUsageByUser.length <= appliedDiscount.usageLimitPerCustomer) {
      return ReS(res, appliedDiscount, 200);
    } else {
      throw new Error("Maximum limit reached");
    }
  } catch (err) {
    return ReE(res, err.message || "Unable to apply coupon", 400);
  }
};

// Function to create an order
const createNewOrder = async (req, res) => {
  try {
    const newOrderData = {
      customerId: req.body.customerId,
      discountId: req.body.discountId,
      orderStatus: "Ordered",
      orderedProducts: req.body.orderedProducts ? req.body.orderedProducts : [],
      shippingType: req.body.shippingType ? req.body.shippingType : "",
      subTotal: req.body.subTotal ? req.body.subTotal : 0.0,
      discountAmount: req.body.discountAmount ? req.body.discountAmount : 0.0,
      tax: req.body.tax ? req.body.tax : 0.0,
      deliveryFee: req.body.deliveryFee ? req.body.deliveryFee : 0.0,
      shippingFee: req.body.shippingFee ? req.body.shippingFee : 0.0,
      total: req.body.total ? req.body.total : 0.0,
    };

    // console.log("newOrderData", newOrderData);

    const [orderErr, newOrder] = await to(createOrder(newOrderData));
    return ReS(res, newOrder, 200);
  } catch (err) {
    return ReE(res, err.message || "Error creating new order", 400);
  }
};

// Function to update an order
const updateOrder = async (req, res) => {
  try {
    const [updateOrderErr, updateOrderSuccess] = await to(editOrderById(req.body));
    if (updateOrderErr) throw updateOrderErr;
    return ReS(res, updateOrderSuccess, 200);
  } catch (err) {
    return ReE(res, err.message || "Error updating  order", 400);
  }
};

// Function to cancel and order
const cancelOrder = async (req, res) => {
  try {
    const [cacelErr, cancelOrderRes] = await to(cancelOrderById(req.body.orderId));
    if (cacelErr) throw cacelErr;
    return ReS(res, cancelOrderRes, 200);
  } catch (err) {
    return ReE(res, err.message || "Error cancelling  order", 400);
  }
};

// Functo to get orderlist
const getOrderList = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  let orderWhereCondition = {};

  if (req.query.searchText) {
    orderWhereCondition.id = { [db.Sequelize.Op.iLike]: "%" + req.query.searchText + "%" };
  }

  try {
    const orderList = await Orders.findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      distinct: true,
      where: orderWhereCondition,
    });

    return ReS(res, orderList, 200);
  } catch (err) {
    return ReE(res, err.message || "Error fetching discount list", 400);
  }
};

module.exports = { applyCoupon, createNewOrder, updateOrder, cancelOrder, getOrderList };
