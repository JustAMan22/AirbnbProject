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
      Spot.belongsTo(models.User, {
        foreignKey: "ownerId",
      });

      Spot.hasMany(models.Booking, {
        foreignKey: "spotId",
      });

      Spot.hasMany(models.Review, {
        foreignKey: "spotId",
      });

      Spot.hasMany(models.SpotImage, {
        foreignKey: "spotId",
      });
    }
  }
  Spot.init(
    {
      ownerId: DataTypes.INTEGER,
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
        validate: {
          min: -90,
          max: 90,
        },
      },
      lng: {
        type: DataTypes.DECIMAL,
        notEmpty: true,
        allowNull: false,
        validate: {
          min: -180,
          max: 180,
        },
      },
      name: {
        type: DataTypes.STRING,
        validate: {
          len: [0, 50],
        },
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
      avgRating: {
        type: DataTypes.DECIMAL,
      },
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );
  return Spot;
};
