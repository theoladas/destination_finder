Destination Finder (Deno)

Search a city (e.g., Paris, Athens, London) and get nearby notable places with an image, short description, a link, and pins on a map.
Built with a tiny Deno server, client-side JavaScript, OpenStreetMap (Nominatim), Wikipedia, and Leaflet. No API keys required.

<img width="1238" height="735" alt="Screenshot 2025-08-21 at 17 33 57" src="https://github.com/user-attachments/assets/f4861d7c-156c-4027-b2cb-fbb0a04f8705" />


🔗 [Demo](https://theoladas.github.io/destination_finder/)

✨ Features

- City search with geocoding via [OpenStreetMap Nominatim](https://nominatim.org/)
- Nearby notable places via [Wikipedia](https://www.wikipedia.org/) geosearch + summary
- Card layout (image, title, link)
- Leaflet map with markers & popups
- Dark Theme change via [theme-change external library](https://github.com/saadeghi/theme-change)

🧰 Tech stack

- [Deno](https://deno.com/) (local dev server)
- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/#map=6/54.91/-3.43) tiles
- [OpenStreetMap Nominatim](https://github.com/osm-search/Nominatim) (geocoding)
- [Wikipedia API](https://www.mediawiki.org/wiki/API:Nearby_places_viewer) (places & details)
- Plain HTML/CSS/JS

⏳ Diagram

<img width="770" height="359" alt="Screenshot 2025-08-22 at 13 18 17" src="https://github.com/user-attachments/assets/055281f5-ba90-4ff6-b305-306ad14e4e12" />

🏃 Run Locally 

`deno task dev`
