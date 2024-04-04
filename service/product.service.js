const db = require("../models");
const Products = db.products;
const VariantCombinationDetails = db.variantCombinationDetails;
const ProductOptionMapping = db.productOptionMapping;
const ProductOptionValueIdMapping = db.productOptionValueIdMapping;

// Function to update product
const updateSingleProduct = async (newProductData, productId, transaction) => {
  await Products.update(
    newProductData,
    {
      where: { id: productId },
    },
    {
      transaction: transaction,
    },
  );
};

module.exports.updateSingleProduct = updateSingleProduct;

// Function to createNewProductOptionMapping
const createNewProductOptionMapping = async (optionIds = [], productId, transaction) => {
  //   console.log("optionIds", optionIds);
  await Promise.all(
    optionIds.map(async optionId => {
      await ProductOptionMapping.create(
        {
          productId: productId,
          optionId: optionId,
        },
        { transaction: transaction },
      );
    }),
  );
};

module.exports.createNewProductOptionMapping = createNewProductOptionMapping;

// Function to createNewOptionValueIdMapping
const createNewOptionValueIdMapping = async (currentVariantCombinationDetails = [], productId, transaction) => {
  // Function to extract optionValueIds
  let optionValueIds = [];
  currentVariantCombinationDetails.map(variant => {
    let newIdsToAppend = variant?.optionValueIds?.filter(item => !optionValueIds.includes(item));
    optionValueIds = [...optionValueIds, ...newIdsToAppend];
  });

  //   console.log("new optionvalue id", optionValueIds);

  await Promise.all(
    optionValueIds.map(async optionValueId => {
      await ProductOptionValueIdMapping.create(
        {
          productId: productId,
          optionValueId: optionValueId,
        },
        { transaction: transaction },
      );
    }),
  );
};

module.exports.createNewOptionValueIdMapping = createNewOptionValueIdMapping;

// Function to createNewVariantCombinationDetails
const createNewVariantCombinationDetails = async (currentVariantCombinationDetails = [], productId, transaction) => {
  await Promise.all(
    currentVariantCombinationDetails.map(async variant => {
      await VariantCombinationDetails.create(
        {
          combinationName: variant?.combinationName,
          optionValueIds: JSON.stringify(variant?.optionValueIds),
          mrpPrice: variant?.mrpPrice,
          salesPrice: variant?.salesPrice,
          actualPrice: variant?.actualPrice,
          stock: variant?.stock,
          productId: productId,
        },
        { transaction: transaction },
      );
    }),
  );
};

module.exports.createNewVariantCombinationDetails = createNewVariantCombinationDetails;

// Function to get product details based on id
const getProductDetails = async productId => {
  try {
    // Fetch product details including associated data
    const product = await Products.findByPk(productId, {
      include: [VariantCombinationDetails, ProductOptionMapping, ProductOptionValueIdMapping],
    });

    // Convert Sequelize model instance to JSON
    const productJSON = product.toJSON();

    // Return the JSON data
    return productJSON;
  } catch (error) {
    // Handle errors
    console.error("Error fetching product details:", error);
    throw error;
  }
};

module.exports.getProductDetails = getProductDetails;

// Function to destroy a produt and option id mapping
const destroyProductOptionMapping = async (productId, optionId, transaction) => {
  await ProductOptionMapping.destroy(
    {
      where: {
        productId: productId,
        optionId: optionId,
      },
    },
    { transaction: transaction },
  );
};

// Function to update optionIdMappings
const updateOptionIdMappings = async (optionIds = [], productDetail, transaction) => {
  let oldOptionIds = [];
  productDetail["productOptionMappings"].map(optionItem => {
    if (!oldOptionIds.includes(optionItem?.optionId)) {
      oldOptionIds.push(optionItem?.optionId);
    }
  });
  const currentOptionIds = optionIds;
  let removedOptionIds = oldOptionIds.filter(item => !currentOptionIds.includes(item));
  // let existingOptionIds = oldOptionIds.filter((item) => currentOptionIds.includes(item));;;
  let newOptionIds = currentOptionIds.filter(item => !oldOptionIds.includes(item));

  if (newOptionIds.length) {
    let [errorCreatingOptionIds, createdOptionIds] = await to(createNewProductOptionMapping(newOptionIds, productDetail.id, transaction));
    if (errorCreatingOptionIds) {
      throw new Error(errorCreatingOptionIds);
    }
  }

  if (removedOptionIds.length) {
    console.log("removedOptionIds", removedOptionIds);
    removedOptionIds.map(async optionId => {
      let [removeOptionIdsError, removeOptionIds] = await to(destroyProductOptionMapping(productDetail.id, optionId, transaction));
      if (removeOptionIdsError) {
        throw new Error(removeOptionIdsError);
      }
    });
  }
};

module.exports.updateOptionIdMappings = updateOptionIdMappings;

// Function to delete a variantCombinationDetails
const removeVariantCombination = async (variantId, transaction) => {
  // await VariantCombinationDetails.update(
  //   {
  //     isDeleted: true,
  //   },
  //   {
  //     where: {
  //       id: variantId,
  //     },
  //   },
  //   { transaction: transaction },
  // );

  await VariantCombinationDetails.destroy(
    {
      where: {
        id: variantId,
      },
    },
    { transaction: transaction },
  );
};

// Function to update a variantCombinationDetails
const updateExistingCombination = async (updatedVariantData, variantId, transaction) => {
  await VariantCombinationDetails.update(
    updatedVariantData,
    {
      where: {
        id: variantId,
      },
    },
    { transaction: transaction },
  );
};

// Function to update variantCombinatioDetails
const updateVariantCombinationDetails = async (productDetail, variantCombinationDetails, trasaction) => {
  const oldVariantCombinationIds = productDetail.variantCombinationDetails.map(item => item.id);
  const currentVariantCombinationIds = variantCombinationDetails.map(item => item.id);

  // console.log("oldVariantCombinationIds", oldVariantCombinationIds);
  // console.log("currentVariantCombinationIds", currentVariantCombinationIds);

  // Function to remove VariantCombination
  let removedVariantCombinationIds = oldVariantCombinationIds.filter(item => !currentVariantCombinationIds.includes(item));
  removedVariantCombinationIds.map(async variantId => {
    let [removeOptionIdsError, removeOptionIds] = await to(removeVariantCombination(variantId, trasaction));
    if (removeOptionIdsError) {
      throw new Error(removeOptionIdsError);
    }
  });

  // Function to update existing VariantCombination
  let existingVariantCombinationIds = oldVariantCombinationIds.filter(item => currentVariantCombinationIds.includes(item));

  // console.log("removedVariantCombinationIds", removedVariantCombinationIds);
  // console.log("existingVariantCombinationIds", existingVariantCombinationIds);

  if (existingVariantCombinationIds.length) {
    existingVariantCombinationIds.map(async variantId => {
      let updatedVariantData = variantCombinationDetails.find(item => item.id == variantId);
      // console.log("updatedVariantData", updatedVariantData);
      // console.log("before updatedVariantData.optionValueIds", updatedVariantData.optionValueIds);
      updatedVariantData.optionValueIds = JSON.stringify(updatedVariantData.optionValueIds);
      // console.log("after updatedVariantData.optionValueIds", updatedVariantData.optionValueIds);
      let [errorExistingVariantCombination, updateVariantData] = await to(updateExistingCombination(updatedVariantData, variantId, trasaction));
      if (errorExistingVariantCombination) {
        // console.log("errorExistingVariantCombination", errorExistingVariantCombination);
        throw new Error(errorExistingVariantCombination);
      }
    });
  }

  // Function to create an newVariantCombination
  let newVariantCombination = variantCombinationDetails.filter(item => !item.id);
  // console.log("newVariantCombination", newVariantCombination);

  if (newVariantCombination.length) {
    let [errorNewVariantCombination, newVariantCombinationDetails] = await to(createNewVariantCombinationDetails(newVariantCombination, productDetail.id, trasaction));
    if (errorNewVariantCombination) {
      throw new Error(errorNewVariantCombination);
    }
  }
};

module.exports.updateVariantCombinationDetails = updateVariantCombinationDetails;

// Function to update optionValueIdMappings
const updateOptionValueIdMappings = async (variantCombinationDetails, productDetail, transaction) => {
  // Logic to get currentOptionValueIds
  let currentOptionValueIds = [];
  variantCombinationDetails?.map(variant => {
    // console.log(" variantCombinationDetails variant", variant);
    let newIdsToAppend = variant?.optionValueIds?.filter(item => !currentOptionValueIds.includes(item));
    currentOptionValueIds = [...currentOptionValueIds, ...newIdsToAppend];
  });

  // Logic to get previously mapped optionValueIds
  let previousOptionValueIds = [];
  productDetail?.variantCombinationDetails?.map(variant => {
    // console.log(" productDetail variant", variant);
    // if (!variant.isDeleted) {
    let currentVariantValueIds = JSON.parse(variant?.optionValueIds);
    // console.log("currentVariantValueIds", currentVariantValueIds);
    let newIdsToAppend = currentVariantValueIds?.filter(item => !previousOptionValueIds.includes(item));
    previousOptionValueIds = [...previousOptionValueIds, ...newIdsToAppend];
    // }
  });

  // console.log("currentOptionValueIds", currentOptionValueIds);
  // console.log("previousOptionValueIds", previousOptionValueIds);

  let removedOptionValueIds = previousOptionValueIds.filter(id => !currentOptionValueIds.includes(id));
  let newlyAddedOptionValuedIds = currentOptionValueIds.filter(id => !previousOptionValueIds.includes(id));

  // console.log("removedOptionValueIds", removedOptionValueIds);
  // console.log("newlyAddedOptionValuedIds", newlyAddedOptionValuedIds);

  if (newlyAddedOptionValuedIds.length) {
    await Promise.all(
      newlyAddedOptionValuedIds.map(async optionValueId => {
        await ProductOptionValueIdMapping.create(
          {
            productId: productDetail.id,
            optionValueId: optionValueId,
          },
          { transaction: transaction },
        );
      }),
    );
  }

  if (removedOptionValueIds.length) {
    await Promise.all(
      removedOptionValueIds.map(async optionValueId => {
        await ProductOptionValueIdMapping.destroy(
          {
            where: {
              productId: productDetail.id,
              optionValueId: optionValueId,
            },
          },
          { transaction: transaction },
        );
      }),
    );
  }
};

module.exports.updateOptionValueIdMappings = updateOptionValueIdMappings;

// Function to get product list
const getProductListByQuery = async productData => {
  // console.log("productData", productData);
  try {
    const limit = productData.limit;
    const offset = productData.offset;

    let productWhereCondition = {
      isDeleted: false,
    };

    if (productData.searchText) {
      productWhereCondition.productName = { [db.Sequelize.Op.iLike]: "%" + productData.searchText + "%" };
      productWhereCondition.salesPrice = { [db.Sequelize.Op.between]: [productData.filter.minPrice, productData.filter.maxPrice] };
    }

    const variantWhereCondition = {};
    if (productData.filter) {
      variantWhereCondition.salesPrice = { [db.Sequelize.Op.between]: [productData.filter.minPrice, productData.filter.maxPrice] };
    }
    console.log("variantWhereCondition", variantWhereCondition, productData.filter);

    const [err, productsData] = await to(
      Products.findAndCountAll({
        where: productWhereCondition,
        limit: limit,
        offset: offset,
        distinct: true, // Count only distinct products
        attributes: ["id", "productName", "isVariants", "salesPrice", "mrpPrice", "stock"],
        include: [
          {
            model: VariantCombinationDetails,
            // where: variantWhereCondition,
            attributes: ["id", "combinationName", "isDefault", "salesPrice", "mrpPrice", "stock"],
          },
        ],
      }),
    );

    if (err) {
      console.error("Error while fetching product list:", err);
      throw err;
    }
    return productsData;
  } catch (error) {
    console.error("Error fetching product list:", error);
    throw error;
  }
};

module.exports.getProductListByQuery = getProductListByQuery;
