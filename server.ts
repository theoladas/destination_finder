import { serveFile } from "std/http/file_server.ts";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    return await serveFile(req, "index.html");
  }

  try {
    return await serveFile(req, `.${url.pathname}`);
  } catch {
    return await serveFile(req, "index.html");
  }
};

Deno.serve({ port: 8000 }, handler);
