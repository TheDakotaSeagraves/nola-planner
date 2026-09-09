const express = require("express");
const cors = require("cors");

const placesRouter = require("./routes/places");
const eventsRouter = require("./routes/events");
const itineraryRouter = require("./routes/itinerary");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/places", placesRouter);
app.use("/events", eventsRouter);
app.use("/itinerary", itineraryRouter);

app.get("/", (req, res) => {
  res.json({ message: "NOLA Planner API" });
});

app.listen(PORT, () => {
  console.log(`NOLA Planner API running on http://localhost:${PORT}`);
});
