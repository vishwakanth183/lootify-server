const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = (db, Sequelize) => {
  let Users = db.define(
    "users",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(32),
        allowNull: false,
        required: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobileNumber: {
        type: Sequelize.STRING(15),
        require: true,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
        required: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
        required: false,
      },
    },
    {
      tableName: "users",
      alter: true,
      underscored: true,
    }
  );
  Users.beforeCreate(async (user, options) => {
    let err;
    if (user.changed("password")) {
      let salt, hash;
      let rounds = Math.floor(Math.random() * 5 + 5);
      [err, salt] = await to(bcrypt.genSalt(rounds));
      if (err) {
        console.log(err.message);
      }
      [err, hash] = await to(bcrypt.hash(user.password, salt));
      if (err) {
        console.log(err.message);
      }
      user.password = hash;
    }
  });
  Users.prototype.comparePassword = async (password, hash) => {
    [err, value] = await to(bcrypt.compare(password, hash));
    if (!err) {
      return value;
    } else {
      console.log("passwor compare error", err);
    }
  };
  Users.prototype.JwtGenarateToken = function (id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  };
  Users.association = (models) => {
    Users.hasMany(models.addresses, { foreignKey: "userId" });
  };
  return Users;
};
