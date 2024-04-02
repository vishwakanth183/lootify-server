const db = require("../../models");
const { updateExistingOptionValueIds, updateNewOptionValueIds, updateOptionData, removeOptionValueIds, findOptionProductMapping, destroyOption } = require("../../service/options.service");
const options = db.options;
const optionValues = db.optionValues;
const productOptionMapping = db.productOptionMapping;
const productOptionValueIdMapping = db.productOptionValueIdMapping
const products = db.products

// Function used to get options list
const getOptionsList = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  let optionsWhereCondition = {};

  if (req.query.searchText) {
    optionsWhereCondition.optionName = { [db.Sequelize.Op.iLike]: "%" + req.query.searchText + "%" };
  }


  //   console.log("offset,limit", offset, limit);

  try {
    const optionsList = await options.findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      attributes: ["id", "optionName", "showColors"],
      distinct: true,
      where: optionsWhereCondition,
      include: [
        {
          model: optionValues,
          as: "optionValues",
          attributes: ["id", "value"],
        },
        {
          model: productOptionMapping,
          attributes: ["productId"]
        }
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
      // console.log("updateData", updateData, optionId);

      //   updating the option data
      const [errUpdatingOption, updateOption] = await to(updateOptionData(updateData, optionId, transact));
      if (errUpdatingOption) {
        return ReE(res, errUpdatingOption.message || "Error updating options", 400);
      }

      //   preparing the updation and removal value for optionvalue ids
      const removeIds = req?.body?.removeIds ? req.body.removeIds : [];
      const updatedOptionValues = req?.body?.optionsValues ? req.body.optionsValues : [];

      console.log("removeId", removeIds);
      console.log("updatedOptionValues", updatedOptionValues);

      // Delete option values for removal IDs
      try {
        const removeValueIds = await removeOptionValueIds(removeIds, transact);
        console.log("Option values removed:", removeValueIds);
      } catch (errRemovingOptionValueId) {
        console.error("Error removing option value:", errRemovingOptionValueId);
        throw errRemovingOptionValueId;
      }

      // Update existing option values
      const [errorUpdatingValueIds, updateValueIds] = await to(updateExistingOptionValueIds(updatedOptionValues, transact));
      if (errorUpdatingValueIds) {
        throw errorCreatingNewValueIds;
      }

      // Create new option values
      const [errorCreatingNewValueIds, creatingNewValueIds] = await to(updateNewOptionValueIds(updatedOptionValues, optionId, transact));
      if (errorCreatingNewValueIds) {
        throw errorCreatingNewValueIds.message;
      }
    });

    return ReS(res, "", 200);
  } catch (err) {
    console.log("Error updating options", err);
    return ReE(res, err.message || "Error updating options", 400);
  }
};

// Function used to delete an option
const deleteOption = async (req, res) => {
  try {
    await db.sequelize.transaction(async transact => {
      const optionId = req.body.optionId;
      const optionValueIds = req.body.optionValueIds;

      const [mappingErr, isOptionMapped] = await to(findOptionProductMapping(optionId));
      if (mappingErr) {
        throw mappingErr;
      }
      if (isOptionMapped.length) {
        throw new Error("Can't remove option it is being mapped to products");
      } else {
        const [deleteOptionError, deletedOption] = await to(destroyOption(optionId, optionValueIds, transact));
        console.log("deletedOption", deletedOption);
        if (deleteOptionError) throw deleteOptionError;
        return ReS(res, "Option deleted successfully", 200);
      }
    });
  } catch (error) {
    return ReE(res, error.message || "Error while deleting option", 400);
  }
};

// Function use to get option details
const getOptionDetails = async (req, res) => {
  const optionId = req.query.optionId;
  try {
    // Fetch option details including associated data
    const optionDetail = await options.findByPk(optionId, {
      attributes : ["id","optionName","showColors","description"],
      include: [
        {
          model : optionValues,
          attributes : ["id","value","color"],
          include: [{
            model : productOptionValueIdMapping,
            attributes : ["productId"],
            include : {
              model : products,
              attributes : ["productName"]
            },
          }],
        }
      ],
    });
    return ReS(res, optionDetail, 200);

  } catch (error) {
    // Handle errors
    return ReE(res, error.message || "Error while getting optionDetails", 400);
  }
};

module.exports = { createOption, getOptionsList, updateOption, deleteOption , getOptionDetails };
