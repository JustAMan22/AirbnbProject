"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Bookings";

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
          startDate: "01-01-2024",
          endDate: "02-14-2024",
        },
        {
          spotId: spotIds[1],
          userId: userIds[1],
          startDate: "02-01-2024",
          endDate: "03-14-2024",
        },
        {
          spotId: spotIds[2],
          userId: userIds[2],
          startDate: "04-01-2024",
          endDate: "05-14-2024",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        startDate: { [Op.in]: ["01-01-2024", "02-01-2024", "04-01-2024"] },
      },
      {}
    );
  },
};
