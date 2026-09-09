# NOLA Planner — Handoff Doc

Repo: https://github.com/TheDakotaSeagraves/nola-planner
Branch history: `main` (baseline scaffold) → `feature/drag-and-drop-itinerary` (PR #1, merged) → `feature/cross-day-drag-drop` (PR #2, merged)

## Repo & tooling

| What | Why |
|---|---|
| Single repo `nola-planner` with `api/` and `client/` subfolders | You wanted one combined repo instead of two, so the client and API version together and one PR can span both. |
| `.gitignore` at repo root (`node_modules/`, `dist/`, `.DS_Store`, `*.log`, `.env`) | Keeps build output and local noise out of git; without it the first commit would have pulled in ~thousands of `node_modules` files. |
| GitHub CLI (`gh`) installed via Homebrew | Needed to create the repo and open PRs from the terminal instead of the browser. |
| Repo created public on GitHub under `TheDakotaSeagraves` | Per your choice — public visibility, one combined repo. |
| Branch-per-feature workflow (`feature/drag-and-drop-itinerary`) | Standard practice so `main` always stays deployable and each feature gets its own PR/review point. |

## API (`api/`) — Express + flat JSON files

| What | Why |
|---|---|
| `server.js` — Express app wiring `/places`, `/events`, `/itinerary`, CORS, JSON body parsing | Entry point for the backend; CORS is needed since the Vite dev server (5173) and API (8000) run on different origins. |
| `data/places.json`, `data/events.json`, `data/itinerary.json` | Seed data for NOLA spots (food/music/history/landmark/outdoors) and 2027 festivals (Mardi Gras, Jazz Fest, French Quarter Fest, etc.); `itinerary.json` starts empty and is the only file the app writes to at runtime. |
| `data/store.js` — tiny `readData`/`writeData` helpers | Centralizes file I/O so each route doesn't duplicate `fs.readFileSync`/`writeFileSync` + JSON parsing. |
| `routes/places.js`, `routes/events.js` | Read-only endpoints with optional query filters (`category`, `neighborhood` for places; `category`, `from`/`to` for events) so the client can filter without loading everything. |
| `routes/itinerary.js` — full CRUD (`GET`/`POST`/`PUT`/`DELETE`) | Lets users build a day-by-day plan: add a stop, edit it, remove it. |
| `nodemon.json` (`{"ignore": ["data/*.json"]}`) | **Bug fix.** nodemon was watching every file including `data/itinerary.json`, which the API itself writes to. Every time a user added an itinerary item, the write triggered a nodemon restart mid-request, and the in-flight response died with "Failed to fetch" in the browser. Ignoring the data directory stopped the self-inflicted restart loop. |

## Client (`client/`) — React + Vite + Leaflet

| What | Why |
|---|---|
| Vite React scaffold, stripped of the default counter/demo content | Standard starting point; the default template content wasn't relevant to a trip planner. |
| `react-router-dom` + `<BrowserRouter>` in `main.jsx`, routes in `App.jsx` | Needed three distinct pages (Guide, Events, Itinerary) with normal URL navigation and a nav bar. |
| `leaflet` + `react-leaflet`, `leafletIconFix.js` | You asked for an *interactive* map, not just a list — Leaflet with OpenStreetMap tiles needs no API key. The icon-fix file works around a known Leaflet/Vite bundling issue where default marker pin images 404 unless manually re-pointed. |
| `src/api/client.js` — thin `fetch` wrapper (`getPlaces`, `getEvents`, `getItinerary`, `addItineraryItem`, `updateItineraryItem`, `deleteItineraryItem`, `reorderItinerary`) | One place for API base URL and error handling instead of scattering `fetch` calls across pages. |
| `pages/Guide.jsx` | The "interactive map/guide" ask: category filter buttons, a place list, and a live Leaflet map with a marker + popup per place. "Add to itinerary" hands the place off to the Itinerary page. |
| `pages/Events.jsx` | The "festival/event tracker" ask: lists festivals with dates and category; "Add to itinerary" prefills both the event and its start date. |
| `pages/Itinerary.jsx` | The "trip itinerary builder" ask: a form to add a stop (date/time/place/event/notes), grouped by day, with remove support. Accepts a `draftItem` prop so Guide/Events can hand off a partially-filled entry. |
| `App.css` rewrite, `index.css` rewrite | The default Vite template's `#root { width: 1126px; text-align: center; ... }` styling fought with a full-bleed map layout, so it was replaced with a plain flex/grid layout that actually stretches edge-to-edge. |

## Drag-and-drop reordering (PR #1)

| What | Why |
|---|---|
| `order` field added to itinerary items; `POST /itinerary` now assigns the next order value per day | Items previously had no persisted position — they only sorted by time, which breaks for stops with no time set. `order` gives every item an explicit position independent of time. |
| `PATCH /itinerary/reorder` endpoint (`{ date, orderedIds }`) | Lets the client persist a whole day's new order in one request after a drag, rather than issuing N separate `PUT`s. |
| `reorderItinerary()` added to `api/client.js` | Client-side wrapper for the new endpoint. |
| Native HTML5 drag-and-drop (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) added to itinerary list items, no new dependency | Reordering only needed within a single day's list — the native browser drag API was enough, so no drag-and-drop library (e.g. `react-beautiful-dnd`) was added for something this scoped. |
| Drag handle (⠿) + `.dragging` opacity state in `App.css` | Visual affordance so it's discoverable that rows are draggable, and feedback while dragging. |

## Cross-day drag-and-drop (PR #2)

| What | Why |
|---|---|
| `draggedItem` state changed from a bare id to `{ id, date }` | Needed the item's origin day at drop time to tell a same-day reorder apart from a cross-day move. |
| `handleDrop` rewritten to branch on `source.date !== targetDate` | Same-day drops still just reorder; cross-day drops additionally call `updateItineraryItem(id, { date: targetDate })` to relocate the item before persisting the new order for the target day. |
| Each day's `<ul>` given its own `onDragOver`/`onDrop` (in addition to each `<li>`) | Lets you drop into empty space below a day's existing items — not just directly onto another item — so an item can be appended to the end of a day, and a day with a single item is still a valid drop target. `stopPropagation()` on the `<li>` drop handler keeps a drop-on-item from also firing the day's container handler. |
| `dragOverDate` state + `.day-block.drag-over` style in `App.css` | Cross-day dragging isn't discoverable without a cue — highlights whichever day block is currently under the dragged item. |

## How things were verified

- `npm run lint` and `npm run build` run clean in `client/` after each change (one pre-existing, non-blocking oxlint warning about `setState` in an effect in `Itinerary.jsx` — intentional pattern for syncing form state from navigation, not fixed).
- Full click-through in a real browser (Guide → add place → Itinerary; Events → add event → Itinerary; delete; drag-and-drop reorder, confirmed via direct `DragEvent` dispatch since synthetic mouse-drag doesn't trigger native HTML5 DnD).
- Reorder confirmed to persist across a full page reload (re-fetched from the API, not just client state).
- Repeated itinerary writes confirmed not to crash the API after the nodemon fix.
- Cross-day move verified end to end: dragged an item from one day onto a specific item in another day, confirmed it relocated to the correct position, persisted after reload, and that the source day's remaining items were unaffected.
- Same-day reorder regression-checked after the cross-day change; no console errors during any drag interaction.

## Open items / suggested next steps

- Persist to a real database instead of flat JSON files (fine for local dev, not for concurrent/multi-user use).
- Add auth and multi-trip support if this needs to serve more than one person's plan.
- No automated tests exist yet (manual browser verification only) — worth adding if this grows.
- No touch-device support — native HTML5 drag-and-drop doesn't work on mobile/tablet without extra polyfill work; fine for desktop-only use for now.
