const express = require("express");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");
const { Spot } = require("../../db/models");
const { Review } = require("../../db/models");
const { ReviewImage } = require("../../db/models");
const { SpotImage } = require("../../db/models");
const { Booking } = require("../../db/models");

const { restoreUser } = require("../../utils/auth");
const sequelize = require("sequelize");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username with at least 4 characters."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

// Restore session user/get current user
router.get("/:userId", (req, res) => {
  const { user } = req;
  if (user) {
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };
    return res.json({
      user: safeUser,
    });
  } else return res.json({ user: null });
});


// Sign up
router.post("/signup", validateSignup, async (req, res) => {
  const { email, firstName, lastName, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    email,
    username,
    hashedPassword,
    firstName,
    lastName,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

//Get all spots from current user
router.get("/:userId/spots", requireAuth, async (req, res, next) => {
  let userId = req.params.userId;
  let user = req.user;
  const spots = await Spot.findAll({
    where: {
      ownerId: userId,
    },
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

  for (const spot of spots) {
    const previewImage = await SpotImage.findOne({
      attributes: ["url"],
      where: { spotId: spot.id, preview: true },
    });
    if (previewImage) {
      spot.dataValues.previewImage = previewImage.dataValues.url;
    }
  }

  if (parseInt(user.id) === parseInt(userId)) {
    return res.status(200).json({ Spots: spots });
  } else return res.status(403).json({ message: "Forbidden!" });
});

//Get all reviews of current user
router.get("/:userId/reviews", requireAuth, async (req, res, next) => {
  let userId = req.params.userId;
  const reviews = await Review.findAll({
    where: {
      userId: userId,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
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
          "price",
        ],
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      },
    ],
  });

  for (const review of reviews) {
    const spot = review.Spot;
    const previewImage = await SpotImage.findOne({
      attributes: ["url"],
      where: { spotId: spot.id, preview: true },
    });
    if (previewImage) {
      spot.dataValues.previewImage = previewImage.url;
    }
  }

  return res.status(200).json({ Reviews: reviews });
});

//Get all bookings of current user
router.get("/:userId/bookings", requireAuth, async (req, res) => {
  let userId = req.params.userId;
  const bookings = await Booking.findAll({
    where: {
      userId: userId,
    },
    include: [
      {
        model: Spot,
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
          "price",
        ],
      },
    ],
  });

  for (const booking of bookings) {
    const spot = booking.Spot;
    const previewImage = await SpotImage.findOne({
      attributes: ["url"],
      where: { spotId: spot.id, preview: true },
    });
    if (previewImage) {
      spot.dataValues.previewImage = previewImage.url;
    }
  }

  return res.status(200).json({ Bookings: bookings });
});

module.exports = router;
