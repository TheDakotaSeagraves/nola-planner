const express = require("express");
const { readData, writeData } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  const itinerary = readData("itinerary");
  res.json(itinerary);
});

router.post("/", (req, res) => {
  const { date, time, placeId, eventId, notes } = req.body;

  if (!date) {
    return res.status(400).json({ message: "date is required" });
  }

  const itinerary = readData("itinerary");
  const nextId = itinerary.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const ordersForDate = itinerary
    .filter((item) => item.date === date)
    .map((item) => item.order || 0);
  const nextOrder = ordersForDate.length ? Math.max(...ordersForDate) + 1 : 0;

  const newItem = {
    id: nextId,
    date,
    time: time || null,
    placeId: placeId || null,
    eventId: eventId || null,
    notes: notes || "",
    order: nextOrder,
  };

  itinerary.push(newItem);
  writeData("itinerary", itinerary);

  res.status(201).json(newItem);
});

router.patch("/reorder", (req, res) => {
  const { date, orderedIds } = req.body;

  if (!date || !Array.isArray(orderedIds)) {
    return res
      .status(400)
      .json({ message: "date and orderedIds are required" });
  }

  const itinerary = readData("itinerary");
  orderedIds.forEach((id, index) => {
    const item = itinerary.find((i) => i.id === id && i.date === date);
    if (item) item.order = index;
  });
  writeData("itinerary", itinerary);

  res.json(itinerary.filter((item) => item.date === date));
});

router.put("/:id", (req, res) => {
  const itinerary = readData("itinerary");
  const id = Number(req.params.id);
  const index = itinerary.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Itinerary item not found" });
  }

  itinerary[index] = { ...itinerary[index], ...req.body, id };
  writeData("itinerary", itinerary);

  res.json(itinerary[index]);
});

router.delete("/:id", (req, res) => {
  const itinerary = readData("itinerary");
  const id = Number(req.params.id);
  const filtered = itinerary.filter((item) => item.id !== id);

  if (filtered.length === itinerary.length) {
    return res.status(404).json({ message: "Itinerary item not found" });
  }

  writeData("itinerary", filtered);
  res.status(204).send();
});

module.exports = router;
