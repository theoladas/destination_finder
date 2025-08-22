// Purpose: Encapsulate all DOM lookups and UI rendering logic.

export const domRefs = {
  searchInput: document.getElementById("city"),
  searchButton: document.getElementById("searchBtn"),
  cardsContainer: document.getElementById("cards"),
  statusMessage: document.getElementById("status"),
  resultsCount: document.getElementById("count"),
};

/**
 * Update text in the status area (e.g., “Searching…”, errors, etc.).
 * Applies/removes an `.error` class for styling error states.
 *
 * @param {string} text - Message to display (empty string clears it).
 * @param {boolean} [isError=false] - Whether to style the message as an error.
 */
export const setStatusMessage = (text, isError = false) => {
  domRefs.statusMessage.textContent = text || "";
  domRefs.statusMessage.classList.toggle("error", !!isError);
};

// Clear any previously rendered results and reset the counter.
// Called before rendering new search results.
export const clearResults = () => {
  domRefs.cardsContainer.innerHTML = "";
  domRefs.resultsCount.textContent = "0 results";
};

// Render a list of “places” as cards.
// Each place should be an object like:
// { title, extract, url, img, lat, lon }
// @param {string} cityLabel - Human-readable city name (from Nominatim).
// @param {Array<Object>} places - Array of place objects to render.

export const renderPlaces = (cityLabel, places) => {
  // 1) Reset the current UI state
  clearResults();

  // 2) Update total count + status text
  domRefs.resultsCount.textContent = `${places.length} result${
    places.length === 1 ? "" : "s"
  }`;
  setStatusMessage(cityLabel ? `Showing places around ${cityLabel}` : "");

  // 3) Build one card per place
  places.forEach((place) => {
    // Outer card wrapper
    const card = document.createElement("article");
    card.className = "card";

    // Thumbnail (left-side circle/rounded block)
    const thumb = document.createElement("div");
    thumb.className = "thumb";

    // If we have an image URL from Wikipedia, render it; otherwise, show a placeholder label
    if (place.img) {
      const img = document.createElement("img");
      img.src = place.img;
      img.alt = place.title; // accessibility: describe the image with the place title
      // (Optional perf niceties you could add later)
      // img.loading = "lazy";
      // img.decoding = "async";
      thumb.appendChild(img);
    } else {
      thumb.textContent = "Image";
    }

    // Right-side metadata (title, short description, link)
    const meta = document.createElement("div");
    meta.className = "meta";

    // Place title
    const h3 = document.createElement("h3");
    h3.textContent = place.title;

    // Short description from Wikipedia summary (fallback if missing)
    const desc = document.createElement("p");
    desc.textContent = place.extract || "No description available.";

    // Link out to the full Wikipedia page
    const link = document.createElement("a");
    link.href = place.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open on Wikipedia";

    // Compose the card and attach to the list container
    meta.append(h3, desc, link);
    card.append(thumb, meta);
    domRefs.cardsContainer.appendChild(card);
  });
};
