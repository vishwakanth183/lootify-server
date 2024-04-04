module.exports = (db, Sequelize) => {
  let Orders = db.define(
    "orders",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      orderStatus: {
        type: Sequelize.STRING(100),
      },
      orderedProducts: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      shippingType: {
        type: Sequelize.STRING(100),
      },
      subTotal: {
        type: Sequelize.NUMERIC(8, 2),
      },
      discountAmount: {
        type: Sequelize.NUMERIC(8, 2),
      },
      tax: {
        type: Sequelize.NUMERIC(8, 2),
      },
      shippingFee: {
        type: Sequelize.NUMERIC(8, 2),
      },
      deliveryFee: {
        type: Sequelize.NUMERIC(8, 2),
      },
      total: {
        type: Sequelize.NUMERIC(8, 2),
      },
      isCancelled: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      tableName: "orders",
      alter: true,
    },
  );

  Orders.association = models => {
    Orders.belongsTo(models.customers, { foreignKey: "customerId" });
    Orders.hasOne(models.customerDiscountMapping, { foreignKey: "orderId" });
  };
  return Orders;
};
