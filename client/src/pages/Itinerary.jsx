import { useEffect, useState } from "react";
import {
  getItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItinerary,
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
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

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

  const handleDrop = async (targetDate, targetId) => {
    const source = draggedItem;
    setDraggedItem(null);
    setDragOverDate(null);
    if (!source) return;

    const sameDay = source.date === targetDate;
    if (sameDay && source.id === targetId) return;

    const targetIds = (grouped[targetDate] || []).map((item) => item.id);
    if (sameDay) {
      targetIds.splice(targetIds.indexOf(source.id), 1);
    }
    if (targetId !== null) {
      targetIds.splice(targetIds.indexOf(targetId), 0, source.id);
    } else {
      targetIds.push(source.id);
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === source.id) {
          return { ...item, date: targetDate, order: targetIds.indexOf(item.id) };
        }
        if (item.date === targetDate) {
          return { ...item, order: targetIds.indexOf(item.id) };
        }
        return item;
      })
    );

    try {
      if (!sameDay) {
        await updateItineraryItem(source.id, { date: targetDate });
      }
      await reorderItinerary(targetDate, targetIds);
    } catch (err) {
      setError(err.message);
      loadItinerary();
    }
  };

  const grouped = items.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  Object.values(grouped).forEach((dayItems) =>
    dayItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  const sortedDates = Object.keys(grouped).sort();

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

      {sortedDates.length === 0 && <p>No itinerary items yet.</p>}

      {sortedDates.map((date) => (
        <div
          key={date}
          className={`day-block${dragOverDate === date ? " drag-over" : ""}`}
        >
          <h3>{date}</h3>
          <ul
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverDate(date);
            }}
            onDrop={() => handleDrop(date, null)}
          >
            {grouped[date].map((item) => (
              <li
                key={item.id}
                className={`itinerary-item${
                  draggedItem?.id === item.id ? " dragging" : ""
                }`}
                draggable
                onDragStart={() => setDraggedItem({ id: item.id, date: item.date })}
                onDragEnd={() => {
                  setDraggedItem(null);
                  setDragOverDate(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDate(date);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(date, item.id);
                }}
              >
                <span className="drag-handle" title="Drag to reorder or move to another day">
                  ⠿
                </span>
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
