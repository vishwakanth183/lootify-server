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
db.users = require("./users.model.js")(sequelize, Sequelize);
db.addresses = require("./address.model.js")(sequelize, Sequelize);

// associating tables
Object.keys(db).forEach(modelName => {
  if (db[modelName].association) {
    db[modelName].association(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;
module.exports = db;
