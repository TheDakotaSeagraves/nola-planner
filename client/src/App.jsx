import { useCallback, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Guide from "./pages/Guide";
import Events from "./pages/Events";
import Itinerary from "./pages/Itinerary";
import "./App.css";

function App() {
  const [draftItem, setDraftItem] = useState(null);
  const navigate = useNavigate();

  const handleAddToItinerary = useCallback(
    (partial) => {
      setDraftItem(partial);
      navigate("/itinerary");
    },
    [navigate]
  );

  const clearDraft = useCallback(() => setDraftItem(null), []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>NOLA Planner</h1>
        <nav>
          <NavLink to="/" end>
            Guide
          </NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/itinerary">Itinerary</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={<Guide onAddToItinerary={handleAddToItinerary} />}
          />
          <Route
            path="/events"
            element={<Events onAddToItinerary={handleAddToItinerary} />}
          />
          <Route
            path="/itinerary"
            element={
              <Itinerary draftItem={draftItem} clearDraft={clearDraft} />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
