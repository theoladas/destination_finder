// All map-related logic lives here. We use Leaflet (CDN script in index.html) so this module assumes "L" is available globally.

let mapInstance; // Leaflet map instance
let markersLayer; // Layer group holding all current result markers

// Create the map, set a default view, and add an OSM tile layer.
export const initMap = () => {
  // Center roughly around Europe; zoom=5 gives a regional view
  mapInstance = L.map("map", { zoomControl: true }).setView([51.505, -0.09], 5);

  // OpenStreetMap tiles + attribution
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapInstance);

  // A dedicated layer to collect markers so we can clear/fit them easily
  markersLayer = L.layerGroup().addTo(mapInstance);
};

// Re-center the map. Used after we geocode the city.
export const setMapView = (latitude, longitude, zoom = 6) => {
  mapInstance.setView([latitude, longitude], zoom);
};

// Remove all current markers from the map.
export const clearMarkers = () => {
  markersLayer.clearLayers();
};

// Add markers for each place result.
// Each marker gets a popup with title + link to Wikipedia.
export const addMarkers = (places) => {
  places.forEach((place) => {
    const marker = L.marker([place.lat, place.lon]).addTo(markersLayer);
    marker.bindPopup(
      `<strong>${place.title}</strong><br/>
       <a href="${place.url}" target="_blank" rel="noopener">More info</a>`
    );
  });
};

// Auto-zoom the map to include all markers in view.
export const fitMapToMarkers = () => {
  const all = markersLayer.getLayers();
  if (all.length === 0) return;

  const group = L.featureGroup(all);
  mapInstance.fitBounds(group.getBounds().pad(0.25), { maxZoom: 15 });
};
