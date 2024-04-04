module.exports = (db, Sequelize) => {
  let Discounts = db.define(
    "discounts",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      promoCode: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      discountType: {
        type: Sequelize.STRING(100),
      },
      discountValue: {
        type: Sequelize.NUMERIC(8, 2),
      },
      maxumumDiscountValue: {
        type: Sequelize.NUMERIC(8, 2),
      },
      minimumOrderValue: {
        type: Sequelize.NUMERIC(8, 2),
      },
      isActive: {
        type: Sequelize.BOOLEAN,
      },
      usageLimitPerCustomer: {
        type: Sequelize.NUMERIC,
      },
    },
    {
      tableName: "discounts",
      alter: true,
    },
  );

  Discounts.association = models => {
    Discounts.hasMany(models.customerDiscountMapping, { foreignKey: "discountId" });
  };
  return Discounts;
};
