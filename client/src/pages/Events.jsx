import { useEffect, useState } from "react";
import { getEvents } from "../api/client";

const Events = ({ onAddToItinerary }) => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h2>Events &amp; Festivals</h2>
      {error && <p className="error">{error}</p>}
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id} className="event-card">
            <h3>{event.name}</h3>
            <p className="meta">
              {event.startDate} &ndash; {event.endDate} &middot; {event.category}
            </p>
            <p>{event.description}</p>
            <button
              onClick={() =>
                onAddToItinerary({ eventId: event.id, date: event.startDate })
              }
            >
              Add to itinerary
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
