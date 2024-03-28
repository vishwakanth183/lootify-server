const db = require("../models");
const options = db.options;
const optionValues = db.optionValues;

// Function used to get options list
const getOptionsList = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;

  //   console.log("offset,limit", offset, limit);

  try {
    const optionsList = await options.findAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: optionValues,
          as: "optionValues", // Define the alias for the association
        },
      ],
    });

    return ReS(res, optionsList, 200);
  } catch (err) {
    return ReE(res, err.message || "Error fetching options", 400);
  }
};

// Function used to create an option
const createOption = async (req, res) => {
  try {
    await db.sequelize.transaction(async transact => {
      const newOption = {
        optionName: req.body.name,
        description: req.body.description,
        showColors: req.body.showColors,
      };
      console.log("newoption", newOption);
      const createdOption = await options.create(newOption, { transaction: transact });
      console.log("createdOption", createdOption.id);

      try {
        const newOptionValues = req.body.optionsValues;
        await Promise.all(
          newOptionValues.map(async optionValue => {
            optionValue.optionId = createdOption.id;
            await optionValues.create(optionValue, { transaction: transact });
          }),
        );
      } catch (error) {
        console.log("error creating option values", error);
        throw new Error("Error creating option values");
      }
    });

    return ReS(res, "", 200);
  } catch (err) {
    return ReE(res, err.message || "Some error occurred", 400);
  }
};

// Function used to update an option
const updateOption = async (req, res) => {
  try {
    await db.sequelize.transaction(async transact => {
      console.log(req.query);
      // getting option is from query
      const { optionId } = req.query;

      //  preparing update data for options
      const updateData = {
        optionName: req.body.name,
        description: req.body.description,
        showColors: req.body.showColors,
      };
      console.log("updateData", updateData, optionId);

      //   updating the option data
      await options.update(
        updateData,
        {
          where: { id: optionId },
          returning: true, // Return the updated instance
        },
        { transaction: transact },
      );

      //   preparing the updation and removal value for optionvalue ids
      const removeIds = req?.body?.removeIds ? req.body.removeIds : [];
      const updatedOptionValues = req?.body?.optionsValues ? req.body.optionsValues : [];

      console.log("removeId", removeIds);
      console.log("updatedOptionValues", updatedOptionValues);

      // Delete option values for removal IDs
      try {
        await Promise.all(removeIds.map(async id => optionValues.destroy({ where: { id }, transaction: transact })));
      } catch (error) {
        console.error("Error deleting option values:", error);
        // You can choose to throw the error to rollback the transaction or handle it differently
      }

      // Update existing option values
      try {
        await Promise.all(updatedOptionValues.filter(value => value.id).map(async value => optionValues.update(value, { where: { id: value.id }, transaction: transact })));
      } catch (error) {
        console.error("Error updating option values:", error);
        // You can choose to throw the error to rollback the transaction or handle it differently
      }

      // Create new option values
      try {
        await Promise.all(
          updatedOptionValues
            .filter(value => !value.id)
            .map(async value => {
              value.optionId = optionId;
              await optionValues.create(value, { transaction: transact });
            }),
        );
      } catch (error) {
        console.error("Error creating option values:", error);
        // You can choose to throw the error to rollback the transaction or handle it differently
      }
    });

    return ReS(res, "", 200);
  } catch (err) {
    console.log("Error updating options", err);
    return ReE(res, err.message || "Error updating options", 400);
  }
};

module.exports = { createOption, getOptionsList, updateOption };
