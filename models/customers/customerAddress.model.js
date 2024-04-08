module.exports = (db, Sequelize) => {
  let CustomerAddress = db.define(
    "customerAddress",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      addressLine1: {
        type: Sequelize.STRING(100),
      },
      addressLine2: {
        type: Sequelize.BOOLEAN,
      },
      isDefault : {
        type: Sequelize.STRING(50),
      },
      city: {
        type: Sequelize.STRING(50),
      },
      state: {
        type: Sequelize.STRING(50),
      },
      country: {
        type: Sequelize.STRING(50),
      },
      zipCode: {
        type: Sequelize.STRING(10),
      },
      mobileNumber: {
        type: Sequelize.STRING(15),
      },
      landmark: {
        type: Sequelize.STRING(100),
      },
      addressType: {
        type: Sequelize.STRING(100),
      },
    },
    {
      tableName: "customerAddress",
      alter: true,
    },
  );

  CustomerAddress.association = models => {
    CustomerAddress.belongsTo(models.customers, { foreignKey: "customerId" });
  };
  return CustomerAddress;
};
