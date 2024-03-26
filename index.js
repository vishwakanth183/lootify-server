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
const userRoute = require("./router/auth.router");
const address = require("./router/address.router");

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

// listening server
app.listen(process.env.PORT, process.env.HOST, () => {
  console.log("app is running on ", process.env.PORT);
});
