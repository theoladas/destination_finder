// ---------------------------
// DOM references
// ---------------------------
const inputEl = document.getElementById("city");
const btnEl = document.getElementById("searchBtn");
const cardsEl = document.getElementById("cards");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");

// ---------------------------
// Map (Leaflet)
// ---------------------------
let map, markersLayer;
function initMap() {
  map = L.map("map", { zoomControl: true }).setView([51.505, -0.09], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// ---------------------------
// Utilities
// ---------------------------
function debounce(fn, ms = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
function setStatus(msg, isError = false) {
  statusEl.textContent = msg || "";
  statusEl.classList.toggle("error", !!isError);
}
function clearResults() {
  cardsEl.innerHTML = "";
  markersLayer.clearLayers();
  countEl.textContent = "0 results";
}

// Keep the latest search’s controllers so we can cancel in-flight requests
let geocodeAbort, placesAbort;

// ---------------------------
// Data fetchers
// ---------------------------
async function geocodeCity(query, signal) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
    signal,
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data?.length) throw new Error("No results for that place");
  const { lat, lon, display_name } = data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name };
}

async function fetchNearbyPlaces(
  lat,
  lon,
  radiusMeters = 10_000,
  limit = 6,
  signal
) {
  // 1) Geo search for pages near the coordinates
  const geoUrl = new URL("https://en.wikipedia.org/w/api.php");
  geoUrl.search = new URLSearchParams({
    origin: "*",
    action: "query",
    list: "geosearch",
    gscoord: `${lat}|${lon}`,
    gsradius: String(radiusMeters),
    gslimit: String(limit),
    format: "json",
  });

  const geoRes = await fetch(geoUrl, { signal });
  if (!geoRes.ok) throw new Error("Wikipedia geosearch failed");
  const geoData = await geoRes.json();
  const items = geoData?.query?.geosearch ?? [];

  // 2) For each result, get page summary (title, extract, thumbnail, content_urls)
  const summaries = await Promise.all(
    items.map(async (it) => {
      const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        it.title
      )}`;
      const sRes = await fetch(sumUrl, { signal });
      if (!sRes.ok) return null;
      const s = await sRes.json();
      return {
        title: s.title || it.title,
        extract: s.extract || "",
        url:
          s.content_urls?.desktop?.page ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(it.title)}`,
        img: s.thumbnail?.source || null,
        lat: it.lat,
        lon: it.lon,
      };
    })
  );

  return summaries.filter(Boolean);
}

// ---------------------------
// Rendering
// ---------------------------
function renderResults(cityLabel, places) {
  clearResults();

  countEl.textContent = `${places.length} result${
    places.length === 1 ? "" : "s"
  }`;
  setStatus(cityLabel ? `Showing places around ${cityLabel}` : "");

  places.forEach((p) => {
    // Card
    const card = document.createElement("article");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    if (p.img) {
      const img = document.createElement("img");
      img.src = p.img;
      img.alt = p.title;
      thumb.appendChild(img);
    } else {
      thumb.textContent = "Image";
    }

    const meta = document.createElement("div");
    meta.className = "meta";

    const h3 = document.createElement("h3");
    h3.textContent = p.title;

    const desc = document.createElement("p");
    desc.textContent = p.extract || "No description available.";

    const link = document.createElement("a");
    link.href = p.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open on Wikipedia";

    meta.append(h3, desc, link);
    card.append(thumb, meta);
    cardsEl.appendChild(card);

    // Marker
    const marker = L.marker([p.lat, p.lon]).addTo(markersLayer);
    marker.bindPopup(
      `<strong>${p.title}</strong><br/><a href="${p.url}" target="_blank" rel="noopener">More info</a>`
    );
  });
}

// ---------------------------
// Controller
// ---------------------------
async function runSearch() {
  const q = inputEl.value.trim();
  if (!q) return;

  // Cancel previous requests if any
  geocodeAbort?.abort();
  placesAbort?.abort();
  geocodeAbort = new AbortController();
  placesAbort = new AbortController();

  setStatus("Searching…");
  try {
    const { lat, lon, label } = await geocodeCity(q, geocodeAbort.signal);
    map.setView([lat, lon], 6);

    const places = await fetchNearbyPlaces(
      lat,
      lon,
      10_000,
      6,
      placesAbort.signal
    );
    renderResults(label, places);

    // Fit to markers
    if (markersLayer.getLayers().length > 0) {
      const group = L.featureGroup(markersLayer.getLayers());
      map.fitBounds(group.getBounds().pad(0.25), { maxZoom: 15 });
    } else {
      setStatus(`No notable nearby places found around ${label}.`);
    }
  } catch (err) {
    // Ignore AbortError (expected during fast typing)
    if (err?.name === "AbortError") return;
    console.error(err);
    setStatus("Couldn't find places for that destination.", true);
    clearResults();
  }
}

// ---------------------------
// Boot
// ---------------------------
addEventListener("DOMContentLoaded", () => {
  initMap();
  btnEl.addEventListener("click", runSearch);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
  inputEl.addEventListener(
    "input",
    debounce(() => {
      const v = inputEl.value.trim();
      if (v.length > 2) runSearch();
    }, 600)
  );
});
