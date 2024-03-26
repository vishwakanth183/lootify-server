const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const SignUp = async (req, res) => {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
  };
  let data = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (data) {
    return ReE(res, "alredy exists", 409);
  }
  User.create(user)
    .then(data => {
      return ReS(res, data, 200);
    })
    .catch(err => {
      return ReE(res, err.message || "Some error occurred while creating the user", 400);
    });
};
const SignIn = async (req, res) => {
  let user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    return ReE(res, "invalid credentials", 409);
  } else {
    const match = await user.comparePassword(req.body.password, user.password);
    if (match) {
      generateToken(user, 200, res);
    } else {
      return ReE(res, "worng password", 409);
    }
  }
};
const generateToken = async (user, statusCode, res) => {
  const token = await user.JwtGenarateToken(user.id);
  const options = {
    httpOnly: true,
    expires: new Date(new Date().getTime() + 5 * 60 * 1000),
  };
  res.status(statusCode).json({
    success: true,
    user,
  });
};
module.exports = { SignIn, SignUp };
