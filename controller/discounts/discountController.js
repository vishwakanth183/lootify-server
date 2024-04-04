const db = require("../../models");
const Discounts = db.discounts;
const customerDiscountMapping = db.customerDiscountMapping;

// Function to get discount list
const getDiscountList = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  let discountWhereCondition = {};

  if (req.query.searchText) {
    discountWhereCondition.promoCode = { [db.Sequelize.Op.iLike]: "%" + req.query.searchText + "%" };
  }

  try {
    const discountList = await Discounts.findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      attributes: ["id", "promoCode", "isActive"],
      distinct: true,
      where: discountWhereCondition,
    });

    return ReS(res, discountList, 200);
  } catch (err) {
    return ReE(res, err.message || "Error fetching discount list", 400);
  }
};

// Function to add an discount
const addDiscount = (req, res) => {
  const newDiscount = req.body;
  Discounts.create(newDiscount)
    .then(data => {
      return ReS(res, data, 200);
    })
    .catch(err => {
      return ReE(res, err.message || "Some error occurred while creating the discount", 400);
    });
};

// Function to edit an discount
const editDiscount = (req, res) => {
  const updateDiscount = req.body;
  console.log("req body", req.body, updateDiscount.id);
  Discounts.update(updateDiscount, {
    where: {
      id: updateDiscount.id,
    },
  })
    .then(data => {
      return ReS(res, data, 200);
    })
    .catch(err => {
      return ReE(res, err.message || "Error updating discount", 400);
    });
};

// Function to delete an discount
const deleteDiscount = (req, res) => {
  const discountId = req.body.id;

  Discounts.destroy({
    where: {
      id: discountId,
    },
  })
    .then(data => {
      return ReS(res, "Deleted discount successfully", 200);
    })
    .catch(err => {
      return ReE(res, err.message || "Error deleteing discount", 400);
    });
};

module.exports = { getDiscountList, addDiscount, editDiscount, deleteDiscount };
