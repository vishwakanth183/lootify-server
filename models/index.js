const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// intializing application models
const db = {};
db.users = require("./users/users.model.js")(sequelize, Sequelize);
db.addresses = require("./users/address.model.js")(sequelize, Sequelize);
db.options = require("./products/options/options.model.js")(sequelize, Sequelize);
db.optionValues = require("./products/options/optionValues.model.js")(sequelize, Sequelize);
db.products = require("./products/products.model.js")(sequelize, Sequelize);
db.variantCombinationDetails = require("./products/variantCombinationDetails.model.js")(sequelize, Sequelize);
db.productOptionMapping = require("./products/mappings/productOptionMapping.model.js")(sequelize, Sequelize);
db.productOptionValueIdMapping = require("./products/mappings/productOptionValueIdMapping.model.js")(sequelize, Sequelize);
db.discounts = require("./discounts/discount.model.js")(sequelize, Sequelize);
db.discountUserMapping = require("./discounts/discountUserMapping.model.js")(sequelize, Sequelize);
db.customers = require("./customers/customers.model.js")(sequelize, Sequelize);
db.customerAddress = require("./customers/customerAddress.model.js")(sequelize, Sequelize);
db.orders = require("./orders/orders.models.js")(sequelize, Sequelize);

// associating tables
Object.keys(db).forEach(modelName => {
  if (db[modelName].association) {
    db[modelName].association(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;
module.exports = db;
