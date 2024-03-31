module.exports = (db, Sequelize) => {
  let ProductOptionValueIdMapping = db.define(
    "productOptionValueIdMapping",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      tableName: "productOptionValueIdMapping",
    },
  );
  ProductOptionValueIdMapping.association = models => {
    ProductOptionValueIdMapping.belongsTo(models.products, {
      foreignKey: "productId",
    });
    ProductOptionValueIdMapping.belongsTo(models.optionValues, {
      foreignKey: "optionValueId",
    });
  };
  return ProductOptionValueIdMapping;
};
