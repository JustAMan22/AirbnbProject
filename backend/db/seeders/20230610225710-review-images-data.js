"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "ReviewImages";

    const reviews = await queryInterface.sequelize.query(
      "SELECT id FROM Reviews;"
    );
    const reviewIds = reviews[0].map((review) => review.id);

    return queryInterface.bulkInsert(
      options,
      [
        {
          reviewId: reviewIds[0],
          url: "https://www.image.com/1",
        },
        {
          reviewId: reviewIds[1],
          url: "https://www.image.com/2",
        },
        {
          reviewId: reviewIds[2],
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
