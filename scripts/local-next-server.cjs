// Fallback local Next.js launcher for Windows environments where `next dev`
// cannot fork its wrapper worker. This keeps the server in one Node process.
const http = require("http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const app = next({ dev: true, dir: process.cwd(), hostname: "localhost", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((request, response) => handle(request, response)).listen(port, "0.0.0.0", () => {
    console.log(`RefinaAI frontend ready at http://localhost:${port}`);
  });
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
