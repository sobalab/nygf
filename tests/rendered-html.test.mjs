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

// The catalogue is the whole site's SEO surface and every page of it is
// prerendered. That is a property of the code rather than of the config: one
// `cookies()` call, one session read in a shared component, or `cacheComponents`
// being switched on quietly turns 200 CDN-served files into 200 function
// invocations, and nothing about the rendered page looks any different.
//   Asserted off the build manifest rather than off a response, because a
// dynamic page still returns the same HTML with the same 200 — the difference
// only shows in how it got there. The count is deliberately a floor and not an
// equality: adding a flower should not fail this, losing the whole mechanism
// should.
test("every catalogue page is still prerendered", async () => {
  const manifest = await import("../.next/prerender-manifest.json", { with: { type: "json" } });
  const slugs = Object.keys(manifest.default.routes).filter((route) => route.startsWith("/catalogue/"));
  assert.ok(
    slugs.length >= 200,
    `expected the catalogue to be prerendered, found ${slugs.length} static paths`,
  );
});
