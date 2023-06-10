"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Reviews";

    const users = await queryInterface.sequelize.query("SELECT id FROM Users;");
    const userIds = users[0].map((user) => user.id);

    const spots = await queryInterface.sequelize.query("SELECT id FROM Spots;");
    const spotIds = spots[0].map((spot) => spot.id);

    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: spotIds[0],
          userId: userIds[0],
          review: "Amazing spot!",
          stars: 4.8,
        },
        {
          spotId: spotIds[1],
          userId: userIds[1],
          review: "Kind of mid spot..",
          stars: 2.8,
        },
        {
          spotId: spotIds[2],
          userId: userIds[2],
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
