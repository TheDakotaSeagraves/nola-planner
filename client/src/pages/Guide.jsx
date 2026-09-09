import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getPlaces } from "../api/client";

const CATEGORIES = ["food", "music", "history", "landmark", "outdoors"];
const NOLA_CENTER = [29.9511, -90.0715];

const Guide = ({ onAddToItinerary }) => {
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getPlaces(category ? { category } : {})
      .then(setPlaces)
      .catch((err) => setError(err.message));
  }, [category]);

  const markers = useMemo(() => places, [places]);

  return (
    <div className="page guide-page">
      <div className="guide-sidebar">
        <h2>Guide</h2>
        <div className="filter-row">
          <button
            className={category === "" ? "active" : ""}
            onClick={() => setCategory("")}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <ul className="place-list">
          {places.map((place) => (
            <li key={place.id} className="place-card">
              <h3>{place.name}</h3>
              <p className="meta">
                {place.category} &middot; {place.neighborhood}
              </p>
              <p>{place.description}</p>
              <button onClick={() => onAddToItinerary({ placeId: place.id })}>
                Add to itinerary
              </button>
            </li>
          ))}
        </ul>
      </div>

      <MapContainer
        center={NOLA_CENTER}
        zoom={13}
        className="guide-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.neighborhood}
              <br />
              {place.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Guide;
