import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test, { after, before } from "node:test";

// Smoke test against a real `next start`, so it exercises the same server
// Vercel runs rather than poking at .next internals, which move between
// releases. Assumes `next build` already ran (see the `test` script).
const PORT = 3111;
const BASE = `http://127.0.0.1:${PORT}`;

let server;

before(async () => {
  server = spawn("npx", ["next", "start", "--port", String(PORT)], {
    cwd: new URL("../", import.meta.url),
    stdio: "ignore",
  });

  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(1000) });
      return;
    } catch {
      if (Date.now() > deadline) throw new Error("next start never came up");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
});

after(() => {
  server?.kill();
});

async function getHtml(path) {
  const response = await fetch(`${BASE}${path}`);
  assert.equal(response.status, 200, `${path} did not return 200`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("home page renders the shop identity", async () => {
  const html = await getHtml("/");
  assert.match(html, /New York Garden Flower Wholesale/);
  assert.match(html, /<title>[^<]*Direct Importer Since 1990/);
  assert.match(html, /og:image/);
});

test("catalogue page renders flowers", async () => {
  const html = await getHtml("/catalogue");
  assert.match(html, /Our Flowers/);
});

test("contact page renders the shop phone number", async () => {
  const html = await getHtml("/contact");
  assert.match(html, /718-886-1190/);
});

test("serves a 404 for unknown routes", async () => {
  const response = await fetch(`${BASE}/not-a-real-page`);
  assert.equal(response.status, 404);
});
