const { Router } = require("express");
const express = require("express");

const { User } = require("../../db/models");

const { Spot } = require("../../db/models");

const router = express.Router();

//Get all spots
router.get("/", async (req, res, next) => {
  const spots = await Spot.findAll();

  return res.json(spots);
});

//Create spot
router.post("/", async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  const spot = await Spot.create({
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

  const safeSpot = {
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

  return res.json(safeSpot);
});

//Get details of a spot from :spotId
router.get("/:spotId", async (req, res, next) => {
  const spotId = req.params.spotId;

  const spot = await Spot.findByPk(spotId);

  if (spot) return res.json(spot);
  else return res.json({ message: "Spot couldn't be found" });
});

//Add an Image to a Spot based on the Spot's id
router.post("/spots/:spotId/images", async (req, res, next) => {});

module.exports = router;
