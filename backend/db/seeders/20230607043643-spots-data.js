"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Spots";

    const users = await queryInterface.sequelize.query("SELECT id FROM Users;");
    const userIds = users[0].map((user) => user.id);

    return queryInterface.bulkInsert(
      options,
      [
        {
          ownerId: userIds[0],
          address: "3900 Dog Rd Ln",
          city: "Chicago",
          state: "Illinois",
          country: "United States",
          lat: 12.917501,
          lng: 61.185104,
          name: "Wooftastic Mansion",
          description: "A wonderful reTREAT for all your doggy needs!",
          price: 1299.99,
          avgRating: 4.7,
        },
        {
          ownerId: userIds[1],
          address: "4200 Cat Ln Blvd",
          city: "Orlando",
          state: "Florida",
          country: "United States",
          lat: 51.917501,
          lng: 19.185104,
          name: "Kitten Flats",
          description: "Cats live here",
          price: 10999.99,
          avgRating: 4.8,
        },
        {
          ownerId: userIds[2],
          address: "6900 Orangutan Ct",
          city: "Sumtara",
          state: "Islands",
          country: "Indonesia",
          lat: 3.597031,
          lng: 98.678513,
          name: "Orangutan Central",
          description: "🦧",
          price: 99999.99,
          avgRating: 5,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: {
          [Op.in]: ["Wooftastic Mansion", "Kitten Flats", "Orangutan Central"],
        },
      },
      {}
    );
  },
};
