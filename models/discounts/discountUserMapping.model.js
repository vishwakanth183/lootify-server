module.exports = (db, Sequelize) => {
  let DiscountUserMapping = db.define(
    "discountUserMapping",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
    },
    {
      tableName: "discountUserMapping",
      alter: true,
    },
  );

  DiscountUserMapping.association = models => {
    DiscountUserMapping.hasMany(models.discounts, { foreignKey: "discountId" }), DiscountUserMapping.hasMany(models.users, { foreignKey: "userId" });
    DiscountUserMapping.hasOne(models.orders, { foreignKey: "orderId" });
  };
  return DiscountUserMapping;
};
