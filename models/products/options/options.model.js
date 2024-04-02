module.exports = (db, Sequelize) => {
  let Options = db.define(
    "options",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(100),
      },
      optionName: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      showColors: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      tableName: "options",
      alter: true,
    },
  );

  Options.association = models => {
    Options.hasMany(models.optionValues, { foreignKey: "optionId" });
    Options.hasMany(models.productOptionMapping, { foreignKey: "optionId" });
  };
  return Options;
};
