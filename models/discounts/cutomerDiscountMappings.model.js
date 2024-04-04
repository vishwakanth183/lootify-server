module.exports = (db, Sequelize) => {
  let CustomerDiscountMapping = db.define(
    "customerDiscountMapping",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
    },
    {
      tableName: "customerDiscountMapping",
      alter: true,
    },
  );

  CustomerDiscountMapping.association = models => {
    CustomerDiscountMapping.hasMany(models.discounts, { foreignKey: "discountId" }), CustomerDiscountMapping.hasMany(models.users, { foreignKey: "userId" });
    CustomerDiscountMapping.hasOne(models.orders, { foreignKey: "orderId" });
    CustomerDiscountMapping.hasMany(models.customers, { foreignKey: "customerId" });
  };
  return CustomerDiscountMapping;
};
