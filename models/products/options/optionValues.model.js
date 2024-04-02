module.exports = (db, Sequelize) => {
  let OptionValues = db.define(
    "optionValues",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING(300),
        required: true,
      },
      color: {
        type: Sequelize.STRING(50),
      },
    },
    {
      tableName: "optionValues",
      alter: true,
    },
  );

  OptionValues.association = models => {
    OptionValues.belongsTo(models.options, { foreignKey: "optionId" });
    OptionValues.hasMany(models.productOptionValueIdMapping , {foreignKey : "optionValueId"})
  };

  return OptionValues;
};
