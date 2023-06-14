"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Reviews";

    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          userId: 3,
          review: "Amazing spot!",
          stars: 4.8,
        },
        {
          spotId: 2,
          userId: 1,
          review: "Kind of mid spot..",
          stars: 2.8,
        },
        {
          spotId: 3,
          userId: 2,
          review: "Nowhere better on this earth!",
          stars: 5,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        review: {
          [Op.in]: [
            "Amazing spot!",
            "Kind of mid spot..",
            "Nowhere better on this earth!",
          ],
        },
      },
      {}
    );
  },
};
