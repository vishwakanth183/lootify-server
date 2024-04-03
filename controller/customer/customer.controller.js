const db = require("../../models");
const { createCustomerWithAddress, updateCustomerWithAddress } = require("../../service/customer.service");
const Customers = db.customers;
const CustomerAddress = db.customerAddress;

// Function to get customer list
const getCustomerList = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  let customerCondition = {};

  if (req.query.searchText) {
    customerCondition.customerName = { [db.Sequelize.Op.iLike]: "%" + req.query.searchText + "%" };
  }

  try {
    const customerList = await Customers.findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      attributes: ["id", "customerName", "mobileNumber", "email"],
      distinct: true,
      where: customerCondition,
    });

    return ReS(res, customerList, 200);
  } catch (err) {
    return ReE(res, err.message || "Error fetching customer list", 400);
  }
};

// Function to get customer details based on id
const getCustomerDetails = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const customerDetail = await Customers.findByPk(customerId, {
      attributes: ["id", "customerName", "mobileNumber", "email"],
      include: [
        {
          model: CustomerAddress,
        },
      ],
    });

    return ReS(res, customerDetail, 200);
  } catch (err) {
    return ReE(res, err.message || "Error fetching customer details", 400);
  }
};

// Function to add an customer
const addCustomer = async (req, res) => {
  try {
    const [customerErr, createdCustomer] = await to(createCustomerWithAddress(req.body));
    if (customerErr) {
      throw customerErr;
    }
    return ReS(res, createdCustomer, 200);
  } catch (err) {
    return ReE(res, err.message || "Error adding customer details", 400);
  }
};

// Function to edit an customer
const editCustomer = async (req, res) => {
  try {
    const [updateErr, updatedCustomer] = await to(updateCustomerWithAddress(req.body));
    if (updateErr) {
      throw updateErr;
    }
    return ReS(res, updatedCustomer, 200);
  } catch (err) {
    return ReE(res, err.message || "Error updating customer details", 400);
  }
};

// Function to delete an customer
const deleteCustomer = (req, res) => {};

module.exports = { getCustomerList, addCustomer, editCustomer, deleteCustomer, getCustomerDetails };
