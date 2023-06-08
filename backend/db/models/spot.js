"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.hasMany(models.User, {
        foreignKey: "ownerId",
      });
    }
  }
  Spot.init(
    {
      address: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
      },
      lat: {
        type: DataTypes.DECIMAL,
        notEmpty: true,
        allowNull: false,
      },
      lng: {
        type: DataTypes.DECIMAL,
        notEmpty: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        notEmpty: true,
        allowNull: false,
      },
      ownerId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );
  return Spot;
};
