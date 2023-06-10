"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "SpotImages";

    const spots = await queryInterface.sequelize.query("SELECT id FROM Spots;");
    const spotIds = spots[0].map((spot) => spot.id);

    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: spotIds[0],
          url: "https://www.image.com/12",
          preview: true,
        },
        {
          spotId: spotIds[1],
          url: "https://www.image.com/13",
          preview: false,
        },
        {
          spotId: spotIds[2],
          url: "https://www.image.com/14",
          preview: true,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "SpotImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        url: {
          [Op.in]: [
            "https://www.image.com/12",
            "https://www.image.com/13",
            "https://www.image.com/14",
          ],
        },
      },
      {}
    );
  },
};
