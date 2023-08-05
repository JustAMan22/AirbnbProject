"use strict";

const { DECIMAL } = require("sequelize");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "Spots",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        ownerId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
          notEmpty: true,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
          notEmpty: true,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
          notEmpty: true,
        },
        country: {
          type: Sequelize.STRING,
          allowNull: false,
          notEmpty: true,
        },
        lat: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          notEmpty: true,
        },
        lng: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          notEmpty: true,
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          notEmpty: true,
          unique: true,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: false,
          notEmpty: true,
        },
        price: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          notEmpty: true,
        },
        avgRating: {
          type: Sequelize.DECIMAL,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
  },
  down: async (queryInterface, Sequelize) => {
    options.tableName = "Spots";
    return queryInterface.dropTable(options);
  },
};
