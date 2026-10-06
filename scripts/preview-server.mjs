import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.argv[2] ?? ".");
const port = Number(process.env.PORT ?? 4173);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const candidate = path.resolve(root, `.${clean}`);
  return candidate.startsWith(root) ? candidate : null;
}

const server = http.createServer((request, response) => {
  const requested = safePath(request.url ?? "/");
  if (!requested) return response.writeHead(400).end("Bad request");
  const candidates = [
    requested,
    requested.endsWith("/")
      ? path.join(requested, "index.html")
      : `${requested}.html`,
  ];
  const file = candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
  if (!file)
    return response
      .writeHead(404, { "content-type": "text/plain" })
      .end("Not found");
  response.writeHead(200, {
    "content-type": mime[path.extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, "0.0.0.0", () =>
  console.log(`SIGLA preview serving ${root} on ${port}`),
);
