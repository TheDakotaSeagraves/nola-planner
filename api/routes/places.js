const express = require("express");
const { readData } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  const places = readData("places");
  const { category, neighborhood } = req.query;

  let result = places;
  if (category) {
    result = result.filter((p) => p.category === category);
  }
  if (neighborhood) {
    result = result.filter((p) => p.neighborhood === neighborhood);
  }

  res.json(result);
});

router.get("/:id", (req, res) => {
  const places = readData("places");
  const place = places.find((p) => p.id === Number(req.params.id));
  if (!place) return res.status(404).json({ message: "Place not found" });
  res.json(place);
});

module.exports = router;
