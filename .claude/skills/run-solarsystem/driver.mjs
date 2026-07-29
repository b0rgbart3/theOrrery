#!/usr/bin/env node
// Drives the solarSystem Vite app in headless Chromium: loads it, drags the
// canvas to exercise OrbitControls, screenshots before/after, and reports
// any console/page errors. Starts `npm run dev` itself if nothing is
// already listening on the target port, and stops it again on exit.
//
// Usage: node .claude/skills/run-solarsystem/driver.mjs [--url=http://localhost:5173] [--outDir=path]

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const url = args.url || "http://localhost:5173";
const outDir = args.outDir || path.join(process.cwd(), ".claude/skills/run-solarsystem/screenshots");
fs.mkdirSync(outDir, { recursive: true });

async function isUp(u) {
  try {
    const res = await fetch(u);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function waitFor(predicate, timeoutMs, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await predicate()) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

let devServer = null;
let startedServer = false;

if (!(await isUp(url))) {
  devServer = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true });
  startedServer = true;
  const ready = await waitFor(() => isUp(url), 30000);
  if (!ready) {
    console.error(`Dev server did not become ready at ${url} within 30s`);
    process.exit(1);
  }
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("canvas", { timeout: 15000 });
await page.waitForTimeout(1200); // let the first frames / bloom settle

const beforePath = path.join(outDir, "before-drag.png");
await page.screenshot({ path: beforePath });

// Drag across the canvas to prove OrbitControls actually responds to input.
const canvas = await page.$("canvas");
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 220, cy - 60, { steps: 20 });
await page.mouse.up();
await page.waitForTimeout(500);

const afterPath = path.join(outDir, "after-drag.png");
await page.screenshot({ path: afterPath });

await browser.close();

if (startedServer && devServer?.pid) {
  try {
    process.kill(-devServer.pid, "SIGTERM");
  } catch {
    // already gone
  }
}

const result = {
  ok: errors.length === 0,
  errors,
  screenshots: { before: beforePath, after: afterPath },
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
