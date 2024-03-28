module.exports = (db, Sequelize) => {
  let Products = db.define(
    "products",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      productName: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      imgUrl: {
        type: Sequelize.STRING(400),
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
      isVariants: {
        type: Sequelize.BOOLEAN,
      },
      stock: {
        type: Sequelize.NUMERIC(8, 2),
      },
    },
    {
      tableName: "products",
      alter: true,
    },
  );

  Products.association = models => {
    Products.hasMany(models.productOptionMapping, { foreignKey: "productId" });
    Products.hasMany(models.productVariantMapping, { foreignKey: "productId" });
  };
  return Products;
};
