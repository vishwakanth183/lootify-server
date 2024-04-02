const db = require("../models");
const options = db.options;
const optionValues = db.optionValues;
const ProductOptionMapping = db.productOptionMapping;
const ProductOptionValueIdMapping = db.productOptionValueIdMapping;

// Function to handle update option values
const updateOptionData = async (updateData, optionId, transaction) => {
  try {
    return await options.update(
      updateData,
      {
        where: { id: optionId },
        returning: true, // Return the updated instance
      },
      { transaction: transaction },
    );
  } catch (err) {
    throw err;
  }
};

module.exports.updateOptionData = updateOptionData;

// Function to find optionValudId and product mapping
const find_OptionValueId_ProductMapping = async optionValueId => {
  const [errValueIdMapping, fetchedValueIdMapping] = await to(
    ProductOptionValueIdMapping.findAll({
      where: {
        optionValueId: optionValueId,
      },
    }),
  );
  if (errValueIdMapping) {
    throw errValueIdMapping;
  }
  return fetchedValueIdMapping;
};

// Function to handle removeOptionId values
const removeOptionValueIds = async (removeIds, transaction) => {
  try {
    let removeIdMapped = false;

    for (const optionValueId of removeIds) {
      const [mappingError, isOptionValueIdMapped] = await to(find_OptionValueId_ProductMapping(optionValueId));
      //   console.log("isOptionValueIdMapped", isOptionValueIdMapped);

      if (mappingError) {
        throw mappingError;
      }

      console.log("isOptionValueIdMapped", isOptionValueIdMapped);
      if (isOptionValueIdMapped.length) {
        removeIdMapped = true;
        throw new Error("Can't remove optionValue it is being mapped to products");
      }
    }

    if (!removeIdMapped) {
      try {
        return await Promise.all(removeIds.map(async id => optionValues.destroy({ where: { id }, transaction: transaction })));
      } catch (error) {
        console.error("Error deleting option value ids:", error);
        throw error;
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports.removeOptionValueIds = removeOptionValueIds;

// Function to update existing option values
const updateExistingOptionValueIds = async (updatedOptionValues, transaction) => {
  try {
    await Promise.all(updatedOptionValues.filter(value => value.id).map(async value => optionValues.update(value, { where: { id: value.id }, transaction: transaction })));
  } catch (error) {
    console.error("Error updating option values:", error);
    throw error;
  }
};
module.exports.updateExistingOptionValueIds = updateExistingOptionValueIds;

// Function to create new optionValues
const updateNewOptionValueIds = async (updatedOptionValues, optionId, transaction) => {
  try {
    const responseOptionValue = await Promise.all(
      updatedOptionValues
        .filter(value => !value.id)
        .map(async value => {
          value.optionId = optionId;
          await optionValues.create(value, { transaction: transaction });
        }),
    );
    return responseOptionValue;
  } catch (error) {
    console.error("Error creating option values:", error);
    throw error;
  }
};

module.exports.updateNewOptionValueIds = updateNewOptionValueIds;

// Function to find option product mapping
const findOptionProductMapping = async optionId => {
  const [errOptionMapping, optionProductMapping] = await to(
    ProductOptionMapping.findAll({
      where: {
        optionId: optionId,
      },
    }),
  );
  if (errOptionMapping) {
    throw errOptionMapping;
  }
  return optionProductMapping;
};

module.exports.findOptionProductMapping = findOptionProductMapping;

// Function to destory an option
const destroyOption = async (optionId, optionValueIds, transaction) => {
  console.log("destroy option called", optionId);
  // Delete option values for removal IDs
  try {
    const removeValueIds = await removeOptionValueIds(optionValueIds, transaction);

    // if (errorRemove) {
    //   console.log("got u bugger", errorRemove);
    //   throw errorRemove;
    // }

    return await options.destroy({
      where: { id: optionId },
      transaction: transaction,
    });
  } catch (errRemovingOption) {
    console.error("Error removing option value:", errRemovingOption);
    throw errRemovingOption;
  }
};

module.exports.destroyOption = destroyOption;
