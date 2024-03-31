module.exports = (db, Sequelize) => {
  let VariantCombinationDetails = db.define(
    "variantCombinationDetails",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      combinationName: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      optionValueIds: {
        type: Sequelize.STRING,
      },
      mrpPrice: {
        type: Sequelize.NUMERIC(8, 2),
      },
      salesPrice: {
        type: Sequelize.NUMERIC(8, 2),
      },
      actualPrice: {
        type: Sequelize.NUMERIC(8, 2),
      },
      stock: {
        type: Sequelize.NUMERIC(8, 2),
      },
    },
    {
      tableName: "variantCombinationDetails",
      alter: true,
    },
  );


  VariantCombinationDetails.association = models => {
    VariantCombinationDetails.belongsTo(models.products, { foreignKey: "productId" });
  };
  return VariantCombinationDetails;
};
