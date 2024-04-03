require("./middleware/passport");
require("dotenv").config();

// initalizing global function
require("./global_functions.js");

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const db = require("./models");

// importing routes
const userRoute = require("./router/auth/auth.router.js");
const address = require("./router/address/address.router.js");
const optionRoute = require("./router/options/options.router.js");
const productRoute = require("./router/products/product.router.js");
const discountRoute = require("./router/discounts/discount.router.js");
const customerRoute = require("./router/customer/customer.router.js");

// connecting to db
db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db");
  })
  .catch(err => {
    console.log("Failed to sync db: " + err.message);
  });

//   initalizing body-parser and cors
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

// initializing routes
app.use("/auth", userRoute);
app.use("/address", address);
app.use("/options", optionRoute);
app.use("/product", productRoute);
app.use("/discount", discountRoute);
app.use("/customer", customerRoute);

// listening server
app.listen(process.env.PORT, process.env.HOST, () => {
  console.log("app is running on development mode", process.env.PORT);
});
