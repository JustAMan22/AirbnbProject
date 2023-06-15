const { Router } = require("express");
const express = require("express");

const { User } = require("../../db/models");

const { Spot } = require("../../db/models");

const { Review } = require("../../db/models");

const { ReviewImage } = require("../../db/models");

const { SpotImage } = require("../../db/models");

const { Booking } = require("../../db/models");

const { Op } = require("sequelize");

const sequelize = require("sequelize");

const { requireAuth } = require("../../utils/auth");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

const validateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude is not valid"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude is not valid"),
  check("name")
    .exists({ checkFalsy: true })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors,
];

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

//Get all spots
router.get("/", async (req, res, next) => {
  let spotsOutput = {};
  const {
    page = 1,
    size = 20,
    minLat,
    maxLat,
    minLng,
    maxLng,
    minPrice,
    maxPrice,
  } = req.query;

  if (page < 1) {
    errors.page = "Page must be greater than or equal to 1";
  }

  if (size < 1) {
    errors.size = "Size must be greater than or equal to 1";
  }

  const spots = await Spot.findAll({
    include: [
      {
        model: Review,
        attributes: [],
      },
    ],
    attributes: [
      "id",
      "ownerId",
      "address",
      "city",
      "state",
      "country",
      "lat",
      "lng",
      "name",
      "description",
      "price",
      "createdAt",
      "updatedAt",
      [sequelize.fn("AVG", sequelize.col("stars")), "avgRating"],
    ],
    group: ["Spot.Id"],
  });

  for (const spot of spots) {
    const previewImage = await SpotImage.findOne({
      attributes: ["url"],
      where: { spotId: spot.id, preview: true },
    });
    if (previewImage) {
      spot.dataValues.previewImage = previewImage.dataValues.url;
    }
  }

  spotsOutput.spots = spots;

  return res
    .status(200)
    .json({ spotsOutput, page: parseInt(page), size: parseInt(size) });
});

//Create spot
router.post("/", requireAuth, validateSpot, async (req, res, next) => {
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const spot = await Spot.create({
    ownerId,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  let safeSpot = {
    address: spot.address,
    city: spot.city,
    state: spot.state,
    country: spot.country,
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    price: spot.price,
  };
  return res.status(201).json(safeSpot);
});

//Get details of a spot from :spotId
router.get("/:spotId", async (req, res, next) => {
  const spotId = req.params.spotId;

  const spot = await Spot.findOne({
    where: {
      id: spotId,
    },
    include: [
      {
        model: Review,
        attributes: [],
      },
      {
        model: SpotImage,
        attributes: ["id", "url", "preview"],
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    attributes: [
      "id",
      "ownerId",
      "address",
      "city",
      "state",
      "country",
      "lat",
      "lng",
      "name",
      "description",
      "price",
      "createdAt",
      "updatedAt",
      [sequelize.fn("COUNT", sequelize.col("Reviews.id")), "numReviews"],
      [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgStarRating"],
    ],
    group: ["Spot.id", "Owner.id", "SpotImages.id"],
  });

  if (spot) {
    return res.status(200).json(spot);
  } else {
    return res.json({ message: "Spot couldn't be found" });
  }
});

//Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  const { url, preview } = req.body;
  const user = req.user;
  const spotId = req.params.spotId;

  const currentSpot = await Spot.findByPk(spotId);

  if (currentSpot) {
    if (user.id === currentSpot.ownerId) {
      const spotImage = await SpotImage.create({
        url: url,
        preview: preview,
      });
      currentSpot.addSpotImage(spotImage);
      return res.status(200).json(spotImage);
    } else return res.status(403).json({ message: "Forbidden!" });
  } else return res.status(404).json({ message: "Spot couldn't be found!" });
});

//Edit a Spot
router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
  let spotId = req.params.spotId;
  const user = req.user;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  let currentSpot = await Spot.findByPk(spotId);

  if (currentSpot) {
    if (user.id === currentSpot.ownerId) {
      currentSpot.address = address;
      currentSpot.city = city;
      currentSpot.state = state;
      currentSpot.country = country;
      currentSpot.lat = lat;
      currentSpot.lng = lng;
      currentSpot.name = name;
      currentSpot.description = description;
      currentSpot.price = price;

      await currentSpot.save();

      let safeSpot = {
        address: currentSpot.address,
        city: currentSpot.city,
        state: currentSpot.state,
        country: currentSpot.country,
        lat: currentSpot.lat,
        lng: currentSpot.lng,
        name: currentSpot.name,
        description: currentSpot.description,
        price: currentSpot.price,
        createdAt: currentSpot.createdAt,
        updatedAt: currentSpot.updatedAt,
      };

      return res.status(200).json(safeSpot);
    } else return res.status(403).json("Forbidden");
  } else return res.status(404).json("Spot couldn't be found");
});

//Delete spot by Id
router.delete("/:spotId", requireAuth, async (req, res, next) => {
  const user = req.user;
  const spotId = req.params.spotId;

  const currentSpot = await Spot.findByPk(spotId);

  if (currentSpot) {
    if (user.id === currentSpot.ownerId) {
      await currentSpot.destroy();

      return res.status(200).json({ message: "Successfully deleted!" });
    } else return res.status(403).json({ message: "Forbidden!" });
  } else return res.status(404).json({ message: "Spot couldn't be found!" });
});

//Get all reviews by spotId
router.get("/:spotId/reviews", async (req, res, next) => {
  const spotId = req.params.spotId;

  const reviews = await Review.findAll({
    where: {
      spotId: spotId,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      },
    ],
  });

  if (reviews.length) return res.status(200).json(reviews);
  else return res.status(404).json({ message: "Spot couldn't be found" });
});

//Create review by spotId
router.post(
  "/:spotId/reviews",
  requireAuth,
  validateReview,
  async (req, res, next) => {
    const { review, stars } = req.body;
    const spotId = parseInt(req.params.spotId);
    const userId = req.user.id;

    const spot = await Spot.findByPk(spotId);

    const userReviewCheck = await Review.findOne({
      where: {
        userId: userId,
        spotId: spotId,
      },
    });

    if (spot) {
      if (!userReviewCheck) {
        const createdReview = await Review.create({
          userId,
          spotId,
          review,
          stars,
        });
        return res.status(201).json(createdReview);
      } else
        return res
          .status(500)
          .json({ message: "User already has a review for this spot" });
    } else return res.status(404).json({ message: "Spot couldn't be found" });
  }
);

//Get all bookings for a spot based on spotId
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const user = req.user;
  let resultBookings = {};

  const currentSpot = await Spot.findByPk(spotId);

  const bookings = await Booking.findAll({
    where: {
      spotId: spotId,
    },
    include: {
      model: User,
      attributes: ["id", "firstName", "lastName"],
    },
  });

  const notOwnerBookings = await Booking.findAll({
    where: {
      spotId: spotId,
    },
    attributes: ["spotId", "startDate", "endDate"],
  });

  if (currentSpot) {
    if (user.id === currentSpot.ownerId) {
      resultBookings.Bookings = bookings;
      return res.status(200).json(resultBookings);
    } else {
      resultBookings.Bookings = notOwnerBookings;
      return res.status(200).json(resultBookings);
    }
  } else return res.status(404).json({ message: "Spot couldn't be found" });
});

//Create a booking from spot based on spotId
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  let { spotId } = req.params;
  spotId = Number(spotId);

  const { user } = req;
  const spot = await Spot.findByPk(spotId);
  const userId = user.id;
  const { startDate, endDate } = req.body;

  // spot cant be found
  if (!spot) {
    res.statusCode = 404;
    res.json({ message: "Spot coudn't be found" });
  }

  // if spot owned by current user
  if (spot.ownerId === user.id) {
    res.statusCode = 403;
    return res.json({ message: "Forbidden" });
  }

  // endDate cant be before startDate
  if (endDate <= startDate) {
    res.title = "Bad Request";
    res.statusCode = 400;
    return res.json({
      message: "Bad Request",
      errors: { endDate: "endDate cannot be on or before startDate" },
    });
  }
  // booking conflict
  const bookings = await Booking.findAll({ where: { spotId: spotId } });
  for (let book of bookings) {
    const bookedStart = book.startDate;
    const bookedEnd = book.endDate;

    // startDate is same as prior booking
    if (startDate === bookedStart || startDate === bookedEnd)
      return startError();
    // endDate is same as prior booking
    if (endDate === bookedStart || endDate === bookedEnd) return endError();
    // if startDate is in between prior booking
    if (startDate < bookedEnd && startDate > bookedStart) return startError();
    // if endDate is in between prior booking
    if (endDate < bookedEnd && endDate > bookedStart) return endError();
    // if booking is in between start and end date
    if (startDate < bookedStart && endDate > bookedEnd) return bothError();
  }

  function startError() {
    res.statusCode = 403;
    return res.json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
      },
    });
  }
  function endError() {
    res.statusCode = 403;
    return res.json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        endDate: "End date conflicts with an existing booking",
      },
    });
  }
  function bothError() {
    res.statusCode = 403;
    return res.json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }
  const booking = await Booking.create({ spotId, userId, startDate, endDate });

  return res.status(200).json({
    booking,
  });
});

//Delete a spot image
router.delete("/:spotId/images/:imageId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const spotId = req.params.spotId;
  const imageId = req.params.imageId;
  const spot = await Spot.findByPk(spotId);
  const spotImage = await SpotImage.findByPk(imageId);
  if (!spotImage) {
    return res.status(404).json({ message: "Spot Image couldn't be found" });
  }
  if (spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await spotImage.destroy();
  return res.status(200).json({ message: "Successfully deleted" });
});

module.exports = router;
