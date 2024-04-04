const db = require("../models");
const Customers = db.customers;
const CustomerAddress = db.customerAddress;

// Function to create a customer with address mapping
const createCustomerWithAddress = async customerDetails => {
  try {
    await db.sequelize.transaction(async transact => {
      let newCustomerDetails = {
        customerName: customerDetails.customerName,
        mobileNumber: customerDetails.mobileNumber,
        email: customerDetails.email,
      };

      //   console.log("newCustomerDetails", newCustomerDetails);

      const newCustomer = await Customers.create(newCustomerDetails, { transaction: transact });

      // Function to create address array in the table
      let customerAddressArray = customerDetails.addressDetails;
      await Promise.all(
        customerAddressArray.map(async address => {
          (address.customerId = newCustomer.id), await CustomerAddress.create(address, { transaction: transact });
        }),
      );

      return newCustomer;
    });
  } catch (err) {
    throw err;
  }
};

module.exports.createCustomerWithAddress = createCustomerWithAddress;

// Function to update a customer with address mapping
const updateCustomerWithAddress = async customerDetails => {
  try {
    await db.sequelize.transaction(async transact => {
      const customerId = customerDetails.id;

      let editedCustomerData = {
        customerName: customerDetails.customerName,
        mobileNumber: customerDetails.mobileNumber,
        email: customerDetails.email,
      };

      const previousAddressDetails = await CustomerAddress.findAll({ where: { customerId: customerId } });

      const updatedCustomer = await Customers.update(editedCustomerData, { where: { id: customerId } }, { transaction: transact });
      const oldAddressIds = previousAddressDetails.map(address => {
        return address.id;
      });
      const removedAddressIds = customerDetails.removedAddressIds ? customerDetails.removedAddressIds : [];
      const existingAddress = customerDetails.addressDetails.filter(address => address.id);
      const newAddress = customerDetails.addressDetails.filter(address => !address.id);

      //   removeOldAddresss function
      if (removedAddressIds.length) {
        await Promise.all(
          removedAddressIds.map(async addressId => {
            await CustomerAddress.destroy({ where: { id: addressId } }, { transaction: transact });
          }),
        );
      }

      //   updateExsisting address
      if (existingAddress.length) {
        await Promise.all(
          existingAddress.map(async updateAddress => {
            await CustomerAddress.update(updateAddress, { where: { id: updateAddress.id } }, { transaction: transact });
          }),
        );
      }

      //   adding new address
      if (existingAddress.length) {
        await Promise.all(
          newAddress.map(async address => {
            (address.customerId = customerId), await CustomerAddress.create(address, { transaction: transact });
          }),
        );
      }

      return updatedCustomer;
    });
  } catch (err) {
    throw err;
  }
};

module.exports.updateCustomerWithAddress = updateCustomerWithAddress;

// Function to delete customer and mapped address
const destroyCustomerWithAddress = async customerId => {
  // console.log("delete customer id", customerId);
  try {
    await db.sequelize.transaction(async transact => {
      const mappedCustomerAddress = await CustomerAddress.findAll({ where: { customerId: customerId } });
      let mappedAddressIds = mappedCustomerAddress.map(address => address.id);
      // console.log("mappedAddressIds"), mappedAddressIds;
      await CustomerAddress.destroy({ where: { id: mappedAddressIds } }, { transaction: transact });
      const destroyedCustomerDetails = await Customers.destroy({ where: { id: customerId } }, { transaction: transact });
      return destroyedCustomerDetails;
    });
  } catch (err) {
    throw err;
  }
};

module.exports.destroyCustomerWithAddress = destroyCustomerWithAddress;
