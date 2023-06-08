const express = require("express");

const { User } = require("../../db/models");

const { Spot } = require("../../db/models");

const router = express.Router();

//Get all spots
router.get("/", async (req, res, next) => {
  const spots = await Spot.findAll();

  return res.json(spots);
});

module.exports = router;
