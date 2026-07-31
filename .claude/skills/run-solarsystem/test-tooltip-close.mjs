import { chromium } from "playwright";

const url = "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto(url);
await page.waitForSelector("canvas");
await page.waitForTimeout(1500);

const canvas = await page.$("canvas");
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2 - 40; // Sun renders slightly above viewport center

// Click the Sun (at scene origin, roughly center of the initial camera view)
await page.mouse.click(cx, cy);
await page.waitForTimeout(1200); // let camera transition settle

const tooltipVisible1 = await page.$(".planet-label");
console.log("tooltip visible after selecting sun:", !!tooltipVisible1);

await page.screenshot({ path: "/private/tmp/claude-501/-Users-bluebhanu-Sites-AntiGravity-VibeCoding-solarSystem/e2b0a21e-e0b2-4907-b69f-dca371d1dd6b/scratchpad/1-selected.png" });

// grab a pixel-data fingerprint of the canvas (base64) before closing
const before = await canvas.screenshot();

// click the close button
const closeBtn = await page.$(".planet-label__close");
if (!closeBtn) {
  console.log("ERROR: close button not found");
} else {
  await closeBtn.click();
}
await page.waitForTimeout(100);

const tooltipVisible2 = await page.$(".planet-label");
console.log("tooltip visible after close:", !!tooltipVisible2);

const rightAfterClose = await canvas.screenshot({ path: "/private/tmp/claude-501/-Users-bluebhanu-Sites-AntiGravity-VibeCoding-solarSystem/e2b0a21e-e0b2-4907-b69f-dca371d1dd6b/scratchpad/2a-right-after-close.png" });

// If the camera were transitioning back to overview, ~1.5s (well past the
// CameraRig's lerp) should show a visibly different (zoomed-out) frame.
await page.waitForTimeout(1800);
const afterSettled = await canvas.screenshot({ path: "/private/tmp/claude-501/-Users-bluebhanu-Sites-AntiGravity-VibeCoding-solarSystem/e2b0a21e-e0b2-4907-b69f-dca371d1dd6b/scratchpad/2b-after-1800ms.png" });

console.log("bytes right-after-close:", rightAfterClose.length, " bytes after-1800ms:", afterSettled.length);
console.log("identical buffers:", Buffer.compare(rightAfterClose, afterSettled) === 0);

await browser.close();
