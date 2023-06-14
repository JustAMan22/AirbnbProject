"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "ReviewImages";

    return queryInterface.bulkInsert(
      options,
      [
        {
          reviewId: 1,
          url: "https://www.image.com/1",
        },
        {
          reviewId: 2,
          url: "https://www.image.com/2",
        },
        {
          reviewId: 3,
          url: "https://www.image.com/3",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "ReviewImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        url: {
          [Op.in]: [
            "https://www.image.com/1",
            "https://www.image.com/2",
            "https://www.image.com/3",
          ],
        },
      },
      {}
    );
  },
};
