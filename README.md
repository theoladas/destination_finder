Destination Finder (Deno)

Search a city (e.g., Paris, Athens, London) and get nearby notable places with an image, short description, a link, and pins on a map.
Built with a tiny Deno server, client-side JavaScript, OpenStreetMap (Nominatim), Wikipedia, and Leaflet. No API keys required.

<img width="1190" height="681" alt="Screenshot 2025-08-20 at 15 07 55" src="https://github.com/user-attachments/assets/b81d268a-3a92-459e-9e8c-2f7841a2f526" />

🔗 [Demo](https://theoladas.github.io/destination_finder/)

✨ Features

- City search with geocoding via [OpenStreetMap Nominatim](https://nominatim.org/)
- Nearby notable places via [Wikipedia](https://www.wikipedia.org/) geosearch + summary
- Card layout (image, title, link)
- Leaflet map with markers & popups

🧰 Tech stack

- [Deno](https://deno.com/) (local dev server)
- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/#map=6/54.91/-3.43) tiles
- [OpenStreetMap Nominatim](https://github.com/osm-search/Nominatim) (geocoding)
- [Wikipedia API](https://www.mediawiki.org/wiki/API:Nearby_places_viewer) (places & details)
- Plain HTML/CSS/JS

🏃 Run Locally 

`deno task dev`
