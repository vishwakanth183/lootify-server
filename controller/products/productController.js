const db = require("../../models");
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

        await db.sequelize.transaction(async (t) => {
            const productDetail = await Products.create(productData, { transaction: t });

            if (!req.body.isVariants) {
                console.log("create a non variant product");
                // No need to handle ProductOptionMapping and VariantCombinationDetails for non-variant products
            } else {
                // console.log("create a variant product", req.body);
                const optionIds = req.body.optionIds ? req.body.optionIds : [];
                if (optionIds.length) {
                    await Promise.all(optionIds.map(async (optionId) => {
                        await ProductOptionMapping.create({
                            productId: productDetail.id,
                            optionId: optionId
                        }, { transaction: t });
                    }));
                }

                const currentVariantCombinationDetails = req.body.variantCombinationDetails ? req.body.variantCombinationDetails : [];
                // Function to extract optionValueIds
                let optionValueIds = [];
                currentVariantCombinationDetails.map((variant) => {
                    let newIdsToAppend = variant?.optionValueIds?.filter((item) => !optionValueIds.includes(item));
                    optionValueIds = [...optionValueIds, ...newIdsToAppend]
                })
                console.log("new option id", optionValueIds);

                await Promise.all(optionValueIds.map(async (optionValueId) => {
                    await ProductOptionValueIdMapping.create({
                        productId: productDetail.id,
                        optionValueId: optionValueId
                    }, { transaction: t });
                }));

                if (currentVariantCombinationDetails.length) {
                    await Promise.all(currentVariantCombinationDetails.map(async (variant) => {
                        await VariantCombinationDetails.create({
                            combinationName: variant?.combinationName,
                            optionValueIds: String(variant?.optionValueIds),
                            mrpPrice: variant?.mrpPrice,
                            salesPrice: variant?.salesPrice,
                            actualPrice: variant?.actualPrice,
                            stock: variant?.stock,
                            productId: productDetail.id
                        }, { transaction: t });
                    }));
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
    }

    if (!req.body.isVariants) {
        console.log("update a non variant product");
        Products.update(productData, {
            where: { id: productId },
        },).then(data => {
            return ReS(res, "Product updated successfully", 200);
        })
            .catch(err => {
                return ReE(res, err.message || "Some error occurred while updating the product", 400);
            });
    }
    else {
        console.log("update a variant product");

        const productDetail = await Products.findByPk(req.query.productId, { include: [VariantCombinationDetails, ProductOptionMapping] });

        const oldOptionIds = productDetail.productOptionMappings.map((item) => item.optionId)
        const currentOptionIds = req.body.optionIds;
        let removedOptionIds = oldOptionIds.filter((item) => !currentOptionIds.includes(item));
        // let existingOptionIds = oldOptionIds.filter((item) => currentOptionIds.includes(item));;;
        let newOptionIds = req.body.optionIds.filter((item)=> !(item.id));

        if (newOptionIds.length) {
            await Promise.all(newOptionIds.map(async (optionId) => {
                await ProductOptionMapping.create({
                    productId: productDetail.id,
                    optionId: optionId
                }, { transaction: t });
            }));
        }

        if(removedOptionIds.length)
        {
            await Promise.all(removedOptionIds.map(async (optionId) => {
                await ProductOptionMapping.destroy({
                    where : {
                        productId: productDetail.id,
                    optionId: optionId
                    }
                }, { transaction: t });
            }));
        }


        const oldVariantCombinationIds = productDetail.variantCombinationDetails.map((item) => item.optionId);
        const currentVariantCombinationIds = req.body.variantCombinationDetails.map((item) => item.optionId);
        let removedVariantCombinationIds = oldVariantCombinationIds.filter((item)=>!currentVariantCombinationIds.includes(item));
        let existingVariantCombinationIds = oldVariantCombinationIds.filter((item)=>currentVariantCombinationIds.includes(item));;
        let newVariantCombination = req.body.variantCombinationDetails.filter((item) => !(item.id));
       
    }


};

// Function to get product details
const getProductDetail = async (req, res) => {
    try {
        const productDetail = await Products.findByPk(req.query.productId, { include: [VariantCombinationDetails, db.productOptionMapping] });
        return ReS(res, productDetail, 200);

    }
    catch (err) {
        console.log("Error getting product details", err);
        return ReE(res, err.message || "Error getting product details", 400);
    }
}

module.exports = { addProduct, updateProduct, getProductDetail };
