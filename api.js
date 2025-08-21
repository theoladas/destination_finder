export async function geocodeCity(query, signal) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`;
  const response = await fetch(url, {
    headers: { "Accept-Language": "en" },
    signal,
  });

  if (!response.ok) throw new Error("Geocoding failed");

  const data = await response.json();
  if (!data?.length) throw new Error("No results for that place");

  const { lat, lon, display_name } = data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name };
}

export async function fetchNearbyWikipediaPlaces(
  lat,
  lon,
  radiusMeters = 10000,
  limit = 6,
  signal
) {
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

  const geoResponse = await fetch(geoUrl, { signal });
  if (!geoResponse.ok) throw new Error("Wikipedia geosearch failed");

  const geoData = await geoResponse.json();
  const nearbyPages = geoData?.query?.geosearch ?? [];

  const placeSummaries = await Promise.all(
    nearbyPages.map(async (page) => {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        page.title
      )}`;
      const summaryResponse = await fetch(summaryUrl, { signal });
      if (!summaryResponse.ok) return null;
      const data = await summaryResponse.json();

      return {
        title: data.title || page.title,
        extract: data.extract || "",
        url:
          data.content_urls?.desktop?.page ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        img: data.thumbnail?.source || null,
        lat: page.lat,
        lon: page.lon,
      };
    })
  );

  return placeSummaries.filter(Boolean);
}
