const db = require("../models");
const Address = db.addresses;

// Function to add address to the db
const addAddress = async (req, res) => {
  Address.create(req.body)
    .then(data => {
      return ReS(res, data, 200);
    })
    .catch(err => {
      return ReE(res, err.message || "Some error occurred while adding the address", 400);
    });
};

module.exports = { addAddress };
