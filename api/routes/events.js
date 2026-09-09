const express = require("express");
const { readData } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  const events = readData("events");
  const { category, from, to } = req.query;

  let result = events;
  if (category) {
    result = result.filter((e) => e.category === category);
  }
  if (from) {
    result = result.filter((e) => e.endDate >= from);
  }
  if (to) {
    result = result.filter((e) => e.startDate <= to);
  }

  res.json(result);
});

router.get("/:id", (req, res) => {
  const events = readData("events");
  const event = events.find((e) => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

module.exports = router;
