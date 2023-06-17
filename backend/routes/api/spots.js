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

const validateQuery = [
  check("page")
    .optional(true)
    .isFloat({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),
  check("size")
    .optional(true)
    .isFloat({ min: 1 })
    .withMessage("Size must be greater than or equal to 1"),
  check("maxLng")
    .optional(true)
    .isFloat({ max: 180 })
    .withMessage("Maximum longitude is invalid"),
  check("minLng")
    .optional(true)
    .isFloat({ min: -180 })
    .withMessage("Minumum longitude is invalid"),
  check("maxLat")
    .optional(true)
    .isFloat({ max: 90 })
    .withMessage("Maximum latitude is invalid"),
  check("minLat")
    .optional(true)
    .isFloat({ min: -90 })
    .withMessage("Minumum latitude is invalid"),
  check("maxPrice")
    .optional(true)
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
  check("minPrice")
    .optional(true)
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  handleValidationErrors,
];

//Get all spots
router.get("/", validateQuery, async (req, res, next) => {
  let { page, size, minPrice, maxPrice, minLat, maxLat, minLng, maxLng } =
    req.query;

  if (!page) page = 1;
  if (!size) size = 20;
  if (page > 10) size = 1;
  if (size > 20) size = 20;
  page = parseInt(page);
  size = parseInt(size);
  let pag = {};

  if (page !== 0 && size !== 0) {
    pag.limit = size;
    pag.offset = size * (page - 1);
  }

  const where = {};
  if (minPrice) {
    where.price = { [Op.gte]: minPrice };
  }

  if (maxPrice) {
    where.price = { ...where.price, [Op.lte]: maxPrice };
  }

  if (minLat) {
    where.lat = { [Op.gte]: minLat };
  }

  if (maxLat) {
    where.lat = { ...where.lat, [Op.lte]: maxLat };
  }

  if (minLng) {
    where.lng = { [Op.gte]: minLng };
  }

  if (maxLng) {
    where.lng = { ...where.lng, [Op.lte]: maxLng };
  }

  let results = {};
  const spots = await Spot.findAll({
    include: [
      {
        model: Review,
        attributes: [],
      },
    ],
    where,
    ...pag,
  });

  for (const spot of spots) {
    const previewImage = await SpotImage.findOne({
      attributes: ["url"],
      where: { spotId: spot.id, preview: true },
    });
    if (previewImage) {
      spot.dataValues.previewImage = previewImage.dataValues.url;
    }

    const spotRating = await Spot.findByPk(spot.id, {
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
        [
          sequelize.fn("ROUND", sequelize.fn("AVG", sequelize.col("stars")), 2),
          "avgRating",
        ],
      ],
      group: ["Spot.id"],
    });
    const avgRating = spotRating.dataValues.avgRating;

    if (spotRating) spot.dataValues.avgRating = avgRating;
  }

  results.Spots = spots;
  res.status(200).json({
    Spots: spots,
    page: page,
    size: size,
  });
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

  return res.status(201).json(spot);
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
      [
        sequelize.fn("ROUND", sequelize.fn("AVG", sequelize.col("stars")), 2),
        "avgRating",
      ],
    ],
    group: ["Spot.id", "Owner.id", "SpotImages.id"],
  });

  if (spot) {
    return res.status(200).json(spot);
  } else {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
});

//Add an Image to a Spot based on the Spot"s id
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
      let outputSpotImage = {
        id: spotImage.id,
        url: spotImage.url,
        preview: spotImage.preview,
      };
      currentSpot.addSpotImage(spotImage);
      return res.status(200).json(outputSpotImage);
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
      return res.status(200).json(currentSpot);
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

  if (reviews.length) return res.status(200).json({ Reviews: reviews });
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

  const currentSpot = await Spot.findByPk(spotId);

  const bookings = await Booking.findAll({
    where: {
      spotId: spotId,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });

  const notOwnerBookings = await Booking.findAll({
    where: {
      spotId: spotId,
    },
    attributes: ["spotId", "startDate", "endDate"],
  });

  if (currentSpot) {
    if (user.id === currentSpot.ownerId) {
      return res.status(200).json({ Bookings: bookings });
    } else {
      return res.status(200).json({ Bookings: notOwnerBookings });
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

  if (spot) {
    if (spotImage) {
      if (spot.ownerId === userId) {
        await spotImage.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
      } else return res.status(403).json({ message: "Forbidden" });
    } else
      return res.status(404).json({ message: "Spot Image couldn't be found" });
  } else res.status(404).json({ mesasge: "Spot couldn't be found" });

});

module.exports = router;
