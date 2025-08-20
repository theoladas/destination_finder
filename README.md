Destination Finder (Deno)

Search a city (e.g., Paris, Athens, London) and get nearby notable places with an image, short description, a link, and pins on a map.
Built with a tiny Deno server, client-side JavaScript, OpenStreetMap (Nominatim), Wikipedia, and Leaflet. No API keys required.

<img width="1190" height="681" alt="Screenshot 2025-08-20 at 15 07 55" src="https://github.com/user-attachments/assets/b81d268a-3a92-459e-9e8c-2f7841a2f526" />

🔗 [Demo](https://theoladas.github.io/destination_finder/)

✨ Features

- City search with geocoding via OpenStreetMap Nominatim
- Nearby notable places via Wikipedia geosearch + summary
- Clean card layout (image, title, blurb, link)
- Leaflet map with markers & popups
- Fully static client — perfect for GitHub Pages
- Zero build tools, zero frameworks

🧰 Tech stack

- Deno (local dev server)
- Leaflet + OpenStreetMap tiles
- OpenStreetMap Nominatim (geocoding)
- Wikipedia API (places & details)
- Plain HTML/CSS/JS

🏃 Run Locally 

`deno task dev`
