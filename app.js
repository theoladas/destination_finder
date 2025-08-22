// - Listens to user events (search button / Enter key)
// - Geocodes the city (Nominatim) -> { lat, lon, label }
// - Fetches nearby Wikipedia places -> [{ title, extract, url, img, lat, lon }]
// - Renders cards (UI) and markers (Map)
// -----------------------------------------------------------------------------

import {
  initMap,
  setMapView,
  fitMapToMarkers,
  addMarkers,
  clearMarkers,
} from "./map.js";
import { domRefs, clearResults, renderPlaces, setStatusMessage } from "./ui.js";
import { geocodeCity, fetchNearbyWikipediaPlaces } from "./api.js";

// Keep references to AbortControllers so we can cancel stale requests
// when the user types new input quickly (prevents race conditions & UI flicker).
let geocodeAbort, placesAbort;

/**
 * Execute the full search workflow:
 *  1) Read city query from the input
 *  2) Geocode to coordinates via Nominatim
 *  3) Fetch nearby Wikipedia places
 *  4) Render cards + map markers and fit the map
 */
async function runSearch() {
  const query = domRefs.searchInput.value.trim();
  if (!query) return; // ignore empty input

  // Cancel any in-flight requests from a previous search.
  // This ensures only the most recent query wins.
  geocodeAbort?.abort();
  placesAbort?.abort();
  geocodeAbort = new AbortController();
  placesAbort = new AbortController();

  // Inform the user that we started working
  setStatusMessage("Searching...");

  try {
    // 1) City name -> coordinates (Nominatim)
    //    Returns { lat, lon, label } in your current API contract.
    const { lat, lon, label } = await geocodeCity(query, geocodeAbort.signal);

    // 2) Center the map around the geocoded city
    setMapView(lat, lon, 6);

    // 3) Get notable places near those coordinates (Wikipedia)
    const places = await fetchNearbyWikipediaPlaces(
      lat,
      lon,
      10000, // radius in meters
      6, // max results
      placesAbort.signal
    );

    // 4) Render the UI list + map markers
    clearResults(); // wipe previous cards/count
    renderPlaces(label, places);

    clearMarkers(); // wipe previous markers
    addMarkers(places); // add new markers

    // 5) Auto-zoom if we have results; otherwise show a friendly message
    if (places.length > 0) {
      fitMapToMarkers();
    } else {
      setStatusMessage(`No notable nearby places found around ${label}.`);
    }
  } catch (err) {
    // AbortError is expected if the user types again quickly; ignore it
    if (err.name === "AbortError") return;

    console.error(err);
    setStatusMessage("Couldn't find places for that destination.", true);
    clearResults();
    // (optional) clearMarkers(); // If you also want to remove markers on error
  }
}

// ---------------------------
// App boot (wire up the UI)
// ---------------------------
addEventListener("DOMContentLoaded", () => {
  // Create the Leaflet map + base tiling + marker layer
  initMap();

  // Click the search button
  domRefs.searchButton.addEventListener("click", runSearch);

  // Press Enter while focusing the input
  domRefs.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
});
