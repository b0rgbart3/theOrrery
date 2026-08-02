#!/usr/bin/env node
// One-off: zoom into the scene and screenshot to check orbit arrowhead shape.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const url = "http://localhost:5173";
const outDir = "/private/tmp/claude-501/-Users-bluebhanu-Sites-AntiGravity-VibeCoding-solarSystem/c9f53994-2008-4a77-99c6-a6289b620fbf/scratchpad";
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
  devServer = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true, cwd: process.cwd() });
  startedServer = true;
  const ready = await waitFor(() => isUp(url), 30000);
  if (!ready) {
    console.error("Dev server did not become ready");
    process.exit(1);
  }
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("canvas", { timeout: 15000 });
await page.waitForTimeout(1200);

const canvas = await page.$("canvas");
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

// Zoom in repeatedly via wheel scroll toward the center of the scene.
await page.mouse.move(cx, cy);
for (let i = 0; i < 55; i++) {
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(500);

await page.screenshot({ path: path.join(outDir, "zoomed.png") });

await browser.close();

if (startedServer && devServer?.pid) {
  try {
    process.kill(-devServer.pid, "SIGTERM");
  } catch {}
}
console.log("done");
