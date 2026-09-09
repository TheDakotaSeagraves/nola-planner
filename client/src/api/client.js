const BASE_URL = "http://localhost:8000";

const request = async (path, options) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
};

export const getPlaces = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/places${query ? `?${query}` : ""}`);
};

export const getEvents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/events${query ? `?${query}` : ""}`);
};

export const getItinerary = () => request("/itinerary");

export const addItineraryItem = (item) =>
  request("/itinerary", { method: "POST", body: JSON.stringify(item) });

export const updateItineraryItem = (id, item) =>
  request(`/itinerary/${id}`, { method: "PUT", body: JSON.stringify(item) });

export const deleteItineraryItem = (id) =>
  request(`/itinerary/${id}`, { method: "DELETE" });
