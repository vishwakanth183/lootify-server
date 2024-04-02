const db = require("../../models");
const { createNewProductOptionMapping, createNewOptionValueIdMapping, createNewVariantCombinationDetails, getProductDetails, updateOptionIdMappings, updateVariantCombinationDetails, updateOptionValueIdMappings, updateSingleProduct, getProductListByQuery } = require("../../service/product.service");
const Products = db.products;
const VariantCombinationDetails = db.variantCombinationDetails;
const ProductOptionMapping = db.productOptionMapping;
const ProductOptionValueIdMapping = db.productOptionValueIdMapping;

// Function to add products to the db
const addProduct = async (req, res) => {
  try {
    const productData = {
      productName: req.body.productName,
      imgUrl: req.body.imgUrl,
      mrpPrice: req.body.mrpPrice,
      salesPrice: req.body.salesPrice,
      actualPrice: req.body.actualPrice,
      isVariants: req.body.isVariants,
      stock: req.body.stock,
      isDeleted: false,
    };

    await db.sequelize.transaction(async t => {
      const productDetail = await Products.create(productData, { transaction: t });

      if (!req.body.isVariants) {
        console.log("created product successfully");
      } else {
        const currentVariantCombinationDetails = req.body.variantCombinationDetails ? req.body.variantCombinationDetails : [];

        // creating optionValueMapping with productId
        const optionIds = req.body.optionIds ? req.body.optionIds : [];
        if (optionIds.length) {
          let [errorCreatingOptionIds, createdOptionIds] = await to(createNewProductOptionMapping(optionIds, productDetail.id, t));
          if (errorCreatingOptionIds) {
            // console.log("errorCreatingOptionIds", errorCreatingOptionIds);
            return ReE(
              res,
              Object.assign("Failed to create new option product mappings", {
                details: errorCreatingOptionIds.message,
              }),
              422,
            );
          }
        }

        // creating optionValueIdsMapping with productId
        let [errorCreatingOptionValueIds, createdOptionValueIds] = await to(createNewOptionValueIdMapping(currentVariantCombinationDetails, productDetail.id, t));
        if (errorCreatingOptionValueIds) {
          console.log("errorCreatingOptionValueIds", errorCreatingOptionValueIds);
          return ReE(
            res,
            Object.assign("Failed to create new options valueId & product mappings", {
              details: errorCreatingOptionValueIds.message,
            }),
            422,
          );
        }

        if (currentVariantCombinationDetails.length) {
          let [errorCreatingNewVariantCombinationDetails, newVariantCombinationDetails] = await to(createNewVariantCombinationDetails(currentVariantCombinationDetails, productDetail.id, t));

          if (errorCreatingNewVariantCombinationDetails) {
            console.log("errorCreatingNewVariantCombinationDetails", errorCreatingNewVariantCombinationDetails);
            return ReE(
              res,
              Object.assign("Failed to create NewVariantCombinationDetails", {
                details: errorCreatingNewVariantCombinationDetails.message,
              }),
              422,
            );
          }
        }
      }

      return ReS(res, "Product created successfully", 200);
    });
  } catch (error) {
    return ReE(res, error.message || "Some error occurred while creating the product", 400);
  }
};

// Function to edit products to the db
const updateProduct = async (req, res) => {
  await db.sequelize.transaction(async transaction => {
    // getting productId from query
    const { productId } = req.query;

    const productData = {
      productName: req.body.productName,
      imgUrl: req.body.imgUrl,
      mrpPrice: req.body.mrpPrice,
      salesPrice: req.body.salesPrice,
      actualPrice: req.body.actualPrice,
      isVariants: req.body.isVariants,
      stock: req.body.stock,
      isDeleted: false,
    };

    const [updateError, productDataUpdated] = await to(updateSingleProduct(productData, productId, transaction));

    if (updateError) {
      return ReE(res, err.message || "Error updating product details", 400);
    }

    if (!req.body.isVariants) {
      console.log("updated a non variant product");
    } else {
      console.log("update a variant product");

      const [errProductDetail, productDetail] = await to(getProductDetails(productId));

      if (errProductDetail) {
        return ReE(res, err.message || "Some error occurred while fetching the product details", 400);
      }

      //   updating product option mappings
      const [errUpdatingProductOptionMapping, updateProductOptionMapping] = await to(updateOptionIdMappings(req.body.optionIds, productDetail, transaction));

      if (errUpdatingProductOptionMapping) {
        console.log("errUpdatingProductOptionMapping", errUpdatingProductOptionMapping);
        return ReE(res, errUpdatingProductOptionMapping.message || "Some error occurred while updating the product option mappings", 400);
      }

      //   updating product optionValueId mappings

      const [err_Updating_OptionValueId_Mappings, update_OptionValueId_Mappings] = await to(updateOptionValueIdMappings(req.body.variantCombinationDetails, productDetail, transaction));

      if (err_Updating_OptionValueId_Mappings) {
        console.log("err_Updating_OptionValueId_Mappings", err_Updating_OptionValueId_Mappings);
        return ReE(res, err_Updating_OptionValueId_Mappings.message || "Some error occurred while updating the product optionValueId mappings", 400);
      }

      //   updating variant combination mappings
      const [errUpdatingVariant, updatedVariant] = await to(updateVariantCombinationDetails(productDetail, req.body.variantCombinationDetails, transaction));

      if (errUpdatingVariant) {
        console.log("errUpdatingVariant", errUpdatingVariant);
        return ReE(res, errUpdatingVariant.message || "Some error occurred while updating the variant combination mappings", 400);
      }
    }

    return ReS(res, "Product Updated Successfully", 200);
  });
};

// Function to get product details
const getProductDetail = async (req, res) => {
  try {
    const productDetail = await Products.findByPk(req.query.productId, { include: [VariantCombinationDetails, db.productOptionMapping] });
    return ReS(res, productDetail, 200);
  } catch (err) {
    console.log("Error getting product details", err);
    return ReE(res, err.message || "Error getting product details", 400);
  }
};

// Function to get productList
const getProductList = async (req, res) => {
  let productData = req.query;
  productData.filter = req.query.filter ? JSON.parse(req.query.filter) : { minPrice: 0, maxPrice: 1000 };
  // console.log("getProductList", productData);
  const [productListErr, ProductListData] = await to(getProductListByQuery(productData));
  if (productListErr) {
    console.log("Error getting product list", productListErr);
    return ReE(res, productListErr.message || "Error getting product list", 400);
  }
  return ReS(res, ProductListData, 200);
};

module.exports = { addProduct, updateProduct, getProductDetail, getProductList };
