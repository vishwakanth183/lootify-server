module.exports = (db, Sequelize) => {
  let ProductVariantMapping = db.define(
    "productVariantMapping",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      tableName: "productVariantMapping",
    },
  );
  ProductVariantMapping.association = models => {
    ProductVariantMapping.belongsTo(models.products, {
      foreignKey: "productId",
    });
    ProductVariantMapping.belongsTo(models.optionValues, {
      foreignKey: "optionValueId",
    });
  };
  return ProductVariantMapping;
};
