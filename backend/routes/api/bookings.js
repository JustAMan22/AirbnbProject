const { Router } = require("express");
const express = require("express");

const { User } = require("../../db/models");

const { Spot } = require("../../db/models");

const { Review } = require("../../db/models");

const { ReviewImage } = require("../../db/models");

const { SpotImage } = require("../../db/models");

const { Booking } = require("../../db/models");

const sequelize = require("sequelize");

const { requireAuth } = require("../../utils/auth");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

//Delete a booking by :bookingId
router.delete("/:bookingId", requireAuth, async (req, res) => {
  let userId = req.user.id;
  let bookingId = req.params.bookingId;

  const currentBooking = await Booking.findByPk(bookingId);

  if (!currentBooking) {
    return res.status(404).json({ message: "Booking couldn't be found!" });
  }
  let today = new Date();
  let startDate = new Date(currentBooking.startDate);
  const spot = await Spot.findByPk(parseInt(currentBooking.spotId));
  if (spot.ownerId === userId) {
    await currentBooking.destroy();
    return res.status(200).json({ message: "Successfully Deleted!" });
  } else if (userId !== currentBooking.userId) {
    return res.status(403).json({ message: "Forbidden!" });
  }
  if (today > startDate) {
    return res
      .status(403)
      .json({ message: "Bookings that have been started can't be deleted" });
  }

  await currentBooking.destroy();
  return res.status(200).json({ message: "Successfully Deleted!" });
});

//Edit a booking by bookingId
router.put("/:bookingId", requireAuth, async (req, res) => {
  let userId = req.user.id;
  let bookingId = req.params.bookingId;
  const { startDate, endDate } = req.body;
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }
  if (userId !== booking.userId) {
    return res.status(403).json({ message: "Forbidden!" });
  }
  let realStartDate = new Date(startDate);
  let realEndDate = new Date(endDate);
  if (realEndDate <= realStartDate) {
    return res.status(400).json({
      message: "Bad Request",
      errors: { endDate: "endDate cannot be on or before startDate" },
    });
  }
  let oldrealStartDate = new Date(booking.startDate);
  let oldEndDate = new Date(booking.endDate);
  let currentDate = new Date();
  if (currentDate > oldEndDate) {
    return res.status(403).json({ message: "Past bookings can't be modified" });
  }
  //If startDate and endDate conflict with existing bookings
  if (
    realStartDate <= oldEndDate &&
    realStartDate >= oldrealStartDate &&
    realEndDate <= oldEndDate &&
    realEndDate >= oldrealStartDate
  ) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start Date conflicts with an existing booking",
        endDate: "End Date conflicts with an existing booking",
      },
    });
  }
  //If startDate conflicts with existing booking
  else if (realStartDate <= oldEndDate && realStartDate >= oldrealStartDate) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: { startDate: "Start Date conflicts with an existing booking" },
    });
  } //If endDate conflicts with existing booking
  else if (realEndDate <= oldEndDate && realEndDate >= oldrealStartDate) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: { endDate: "End Date conflicts with an existing booking" },
    });
  }
  //If booking is between new start and end date
  else if (realStartDate < oldrealStartDate && realEndDate > oldEndDate) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start Date conflicts with an existing booking",
        endDate: "End Date conflicts with an existing booking",
      },
    });
  }
  booking.startDate = startDate;
  booking.endDate = endDate;
  await booking.save();
  res.status(200).json(booking);
});

module.exports = router;
