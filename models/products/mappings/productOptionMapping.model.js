module.exports = (db, Sequelize) => {
  let ProductOptionMapping = db.define(
    "productOptionMapping",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      tableName: "productOptionMapping",
    },
  );
  ProductOptionMapping.association = models => {
    ProductOptionMapping.belongsTo(models.products, {
      foreignKey: "productId",
    });
    ProductOptionMapping.belongsTo(models.options, {
      foreignKey: "optionId",
    });
  };
  return ProductOptionMapping;
};
