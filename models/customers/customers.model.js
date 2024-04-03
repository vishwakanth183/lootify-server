module.exports = (db, Sequelize) => {
  let Customers = db.define(
    "customers",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customerName: {
        type: Sequelize.STRING(100),
        require: true,
      },
      mobileNumber: {
        type: Sequelize.STRING(10),
        require: true,
      },
      email: {
        type: Sequelize.STRING(100),
      },
    },
    {
      tableName: "customers",
      alter: true,
    },
  );

  Customers.association = models => {
    Customers.hasMany(models.customerAddress, { foreignKey: "customerId" });
    // Customers.hasMany(models.orders) , {foreignKey : "orderId"}
  };
  return Customers;
};
