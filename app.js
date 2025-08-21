import {
  initMap,
  setMapView,
  fitMapToMarkers,
  addMarkers,
  clearMarkers,
} from "./map.js";
import { domRefs, clearResults, renderPlaces, setStatusMessage } from "./ui.js";
import { geocodeCity, fetchNearbyWikipediaPlaces } from "./api.js";
// AbortControllers to cancel in-flight requests on new input
let geocodeAbort, placesAbort;

/**
 * Executes the destination search: geocodes the query and fetches nearby places.
 */
async function runSearch() {
  const query = domRefs.searchInput.value.trim();
  if (!query) return;

  // Abort previous requests if active
  geocodeAbort?.abort();
  placesAbort?.abort();
  geocodeAbort = new AbortController();
  placesAbort = new AbortController();

  setStatusMessage("Searching...");

  try {
    const { lat, lon, label } = await geocodeCity(query, geocodeAbort.signal);
    setMapView(lat, lon, 6);

    const places = await fetchNearbyWikipediaPlaces(
      lat,
      lon,
      10000,
      6,
      placesAbort.signal
    );
    clearResults();
    renderPlaces(label, places);
    clearMarkers();
    addMarkers(places);

    if (places.length > 0) {
      fitMapToMarkers();
    } else {
      setStatusMessage(`No notable nearby places found around ${label}.`);
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    setStatusMessage("Couldn't find places for that destination.", true);
    clearResults();
  }
}

// ---------------------------
// App bootstrap
// ---------------------------
addEventListener("DOMContentLoaded", () => {
  initMap();

  // Button click
  domRefs.searchButton.addEventListener("click", runSearch);

  // Enter key
  domRefs.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
});
