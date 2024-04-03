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
      orderedProducts: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      shippingType: {
        type: Sequelize.STRING(100),
      },
    },
    {
      tableName: "orders",
      alter: true,
    },
  );

  Orders.association = models => {
    Orders.belongsTo(models.customers, { foreignKey: "customerId" });
    Orders.hasOne(models.discountUserMapping, { foreignKey: "orderId" });
  };
  return Orders;
};
