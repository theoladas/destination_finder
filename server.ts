// Minimal static file server for Deno.
// - Serves index.html at "/" and "/index.html"
// - Serves any other file by its path (e.g. /app.js, /global.css)
// - If a requested asset isn't found, it falls back to index.html
//   (typical Single-Page App behavior so client-side routing still works)

import { serveFile } from "std/http/file_server.ts";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  // If the user visits the root or explicitly asks for /index.html,
  // serve the app shell (index.html).
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return await serveFile(req, "index.html");
  }

  try {
    // Try to serve the requested static asset from the local filesystem.
    // Example: GET /app.js -> ./app.js, GET /global.css -> ./global.css
    return await serveFile(req, `.${url.pathname}`);
  } catch {
    // If the file is missing (or any read error occurs),
    // return index.html so the SPA's client-side router can handle the route.
    return await serveFile(req, "index.html");
  }
};

// Start the HTTP server on port 8000.
// Requires: deno run --allow-read --allow-net server.ts
Deno.serve({ port: 8000 }, handler);
