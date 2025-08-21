let mapInstance, markersLayer;

export const initMap = () => {
  mapInstance = L.map("map", { zoomControl: true }).setView([51.505, -0.09], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapInstance);
  markersLayer = L.layerGroup().addTo(mapInstance);
};

export const setMapView = (lat, lon, zoom = 6) => {
  mapInstance.setView([lat, lon], zoom);
};

export const clearMarkers = () => {
  markersLayer.clearLayers();
};

export const addMarkers = (places) => {
  places.forEach((place) => {
    const marker = L.marker([place.lat, place.lon]).addTo(markersLayer);
    marker.bindPopup(
      `<strong>${place.title}</strong><br/><a href="${place.url}" target="_blank" rel="noopener">More info</a>`
    );
  });
};

export const fitMapToMarkers = () => {
  if (markersLayer.getLayers().length > 0) {
    const group = L.featureGroup(markersLayer.getLayers());
    mapInstance.fitBounds(group.getBounds().pad(0.25), { maxZoom: 15 });
  }
};
