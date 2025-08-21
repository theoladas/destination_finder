export const domRefs = {
  searchInput: document.getElementById("city"),
  searchButton: document.getElementById("searchBtn"),
  cardsContainer: document.getElementById("cards"),
  statusMessage: document.getElementById("status"),
  resultsCount: document.getElementById("count"),
};

export const setStatusMessage = (text, isError = false) => {
  domRefs.statusMessage.textContent = text || "";
  domRefs.statusMessage.classList.toggle("error", !!isError);
};

export const clearResults = () => {
  domRefs.cardsContainer.innerHTML = "";
  domRefs.resultsCount.textContent = "0 results";
};

export const renderPlaces = (cityLabel, places) => {
  clearResults();
  domRefs.resultsCount.textContent = `${places.length} result${
    places.length === 1 ? "" : "s"
  }`;
  setStatusMessage(cityLabel ? `Showing places around ${cityLabel}` : "");

  places.forEach((place) => {
    const card = document.createElement("article");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    if (place.img) {
      const img = document.createElement("img");
      img.src = place.img;
      img.alt = place.title;
      thumb.appendChild(img);
    } else {
      thumb.textContent = "Image";
    }

    const meta = document.createElement("div");
    meta.className = "meta";

    const h3 = document.createElement("h3");
    h3.textContent = place.title;

    const desc = document.createElement("p");
    desc.textContent = place.extract || "No description available.";

    const link = document.createElement("a");
    link.href = place.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open on Wikipedia";

    meta.append(h3, desc, link);
    card.append(thumb, meta);
    domRefs.cardsContainer.appendChild(card);
  });
};
