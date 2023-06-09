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
          userId: 3,
          startDate: "2024-01-14",
          endDate: "2024-02-14",
        },
        {
          spotId: 2,
          userId: 1,
          startDate: "2024-02-15",
          endDate: "2024-3-15",
        },
        {
          spotId: 3,
          userId: 2,
          startDate: "2024-03-16",
          endDate: "2024-04-16",
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
        startDate: { [Op.in]: ["2024-01-14", "2024-02-15", "2024-03-16"] },
      },
      {}
    );
  },
};
