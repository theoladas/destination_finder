// - Nominatim (OpenStreetMap) to geocode a city name -> coordinates
// - Wikipedia GeoSearch + REST Summary to get nearby notable places

export async function geocodeCity(query, signal) {
  // Build the Nominatim search URL (JSON output, 1 result)
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`;

  // Call the API; pass AbortSignal so we can cancel during fast typing
  const response = await fetch(url, {
    headers: { "Accept-Language": "en" },
    signal,
  });

  // Basic network error handling
  if (!response.ok) throw new Error("Geocoding failed");

  // Parse body; ensure we actually got a result
  const data = await response.json();
  if (!data?.length) throw new Error("No results for that place");

  // Nominatim returns strings for lat/lon; convert to numbers
  const { lat, lon, display_name } = data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name };
}

// Fetch notable Wikipedia pages near given coordinates.

// Flow:
//  1) Use MediaWiki Action API "geosearch" to find nearby page titles + coords.
//  2) For each title, call REST "page/summary" to get extract, image, canonical URL.

// @param {number} lat            Latitude in decimal degrees
// @param {number} lon            Longitude in decimal degrees
// @param {number} [radiusMeters=10000]  Search radius (in meters)
// @param {number} [limit=6]      Max number of places to return
// @param {AbortSignal} [signal]  Optional AbortController signal
// @returns {Promise<Array<{title:string, extract:string, url:string, img:string|null, lat:number, lon:number}>>}

export async function fetchNearbyWikipediaPlaces(
  lat,
  lon,
  radiusMeters = 10000,
  limit = 6,
  signal
) {
  // --- Step 1: nearby page titles via GeoSearch ---
  const geoUrl = new URL("https://en.wikipedia.org/w/api.php");
  geoUrl.search = new URLSearchParams({
    origin: "*", // allow CORS from browser
    action: "query",
    list: "geosearch",
    gscoord: `${lat}|${lon}`,
    gsradius: String(radiusMeters),
    gslimit: String(limit),
    format: "json",
  });

  const geoResponse = await fetch(geoUrl, { signal });
  if (!geoResponse.ok) throw new Error("Wikipedia geosearch failed");

  const geoData = await geoResponse.json();
  const nearbyPages = geoData?.query?.geosearch ?? [];

  // --- Step 2: hydrate each page with a summary (extract, image, canonical URL) ---
  const placeSummaries = await Promise.all(
    nearbyPages.map(async (page) => {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        page.title
      )}`;

      const summaryResponse = await fetch(summaryUrl, { signal });
      if (!summaryResponse.ok) return null; // skip any that fail

      const data = await summaryResponse.json();
      return {
        title: data.title || page.title,
        extract: data.extract || "",
        url:
          data.content_urls?.desktop?.page ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        img: data.thumbnail?.source || null,
        // Keep Leaflet-friendly keys for easy marker placement:
        lat: page.lat,
        lon: page.lon,
      };
    })
  );

  // Remove any nulls (e.g., summary fetch failed)
  return placeSummaries.filter(Boolean);
}
