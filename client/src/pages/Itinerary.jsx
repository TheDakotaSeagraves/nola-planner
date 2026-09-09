import { useEffect, useState } from "react";
import {
  getItinerary,
  addItineraryItem,
  deleteItineraryItem,
  getPlaces,
  getEvents,
} from "../api/client";

const emptyForm = { date: "", time: "", placeId: "", eventId: "", notes: "" };

const Itinerary = ({ draftItem, clearDraft }) => {
  const [items, setItems] = useState([]);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadItinerary = () => {
    getItinerary().then(setItems).catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadItinerary();
    getPlaces().then(setPlaces).catch((err) => setError(err.message));
    getEvents().then(setEvents).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (draftItem) {
      setForm((prev) => ({
        ...prev,
        placeId: draftItem.placeId || "",
        eventId: draftItem.eventId || "",
        date: draftItem.date || "",
      }));
      clearDraft();
    }
  }, [draftItem, clearDraft]);

  const placeName = (id) => places.find((p) => p.id === id)?.name;
  const eventName = (id) => events.find((e) => e.id === id)?.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) {
      setError("Date is required");
      return;
    }
    try {
      await addItineraryItem({
        date: form.date,
        time: form.time || null,
        placeId: form.placeId ? Number(form.placeId) : null,
        eventId: form.eventId ? Number(form.eventId) : null,
        notes: form.notes,
      });
      setForm(emptyForm);
      setError("");
      loadItinerary();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    await deleteItineraryItem(id);
    loadItinerary();
  };

  const grouped = items
    .slice()
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
    .reduce((acc, item) => {
      acc[item.date] = acc[item.date] || [];
      acc[item.date].push(item);
      return acc;
    }, {});

  return (
    <div className="page">
      <h2>Itinerary</h2>
      {error && <p className="error">{error}</p>}

      <form className="itinerary-form" onSubmit={handleSubmit}>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </label>
        <label>
          Place
          <select
            value={form.placeId}
            onChange={(e) => setForm({ ...form, placeId: e.target.value })}
          >
            <option value="">None</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Event
          <select
            value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}
          >
            <option value="">None</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </label>
        <label className="notes-label">
          Notes
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <button type="submit">Add to itinerary</button>
      </form>

      {Object.keys(grouped).length === 0 && <p>No itinerary items yet.</p>}

      {Object.entries(grouped).map(([date, dayItems]) => (
        <div key={date} className="day-block">
          <h3>{date}</h3>
          <ul>
            {dayItems.map((item) => (
              <li key={item.id} className="itinerary-item">
                <span className="time">{item.time || "--:--"}</span>
                <span className="label">
                  {item.placeId && placeName(item.placeId)}
                  {item.eventId && eventName(item.eventId)}
                  {!item.placeId && !item.eventId && "Untitled stop"}
                </span>
                {item.notes && <span className="notes">{item.notes}</span>}
                <button onClick={() => handleDelete(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Itinerary;
