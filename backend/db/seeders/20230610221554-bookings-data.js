"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Bookings";

    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          userId: 1,
          startDate: "01-01-2024",
          endDate: "02-14-2024",
        },
        {
          spotId: 2,
          userId: 2,
          startDate: "02-01-2024",
          endDate: "03-14-2024",
        },
        {
          spotId: 3,
          userId: 3,
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
