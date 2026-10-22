import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Preserve the complete original signature, flourishes and lettering.
const source = new URL("../public/brand/wearables-by-ashabi.png", import.meta.url);
const app = new URL("../src/app/", import.meta.url);
const preview = new URL("../public/brand/favicon-preview.png", import.meta.url);
const artwork = await sharp(await readFile(source)).trim().png().toBuffer();
const background = "#30372b";
const gold = "#e0bc55";

async function icon(size) {
  const inset = Math.max(1, Math.round(size * 0.025));
  // Reuse the original alpha, rather than redrawing any letter or flourish.
  // A small alpha gain keeps fine strokes from fading at native tab sizes.
  const gain = size <= 16 ? 1.6 : size <= 32 ? 1.25 : 1;
  const { data, info } = await sharp(artwork)
    .resize(size - inset * 2, size - inset * 2, {
      fit: "inside",
      kernel: "lanczos3",
    })
    .ensureAlpha()
    .extractChannel("alpha")
    .linear(gain, 0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const logo = await sharp({
    create: { width: info.width, height: info.height, channels: 3, background: gold },
  })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

// PNG payloads in an ICO directory support crisp tab icons at each native size.
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(icon));
const directory = Buffer.alloc(6 + images.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
images.forEach((data, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(data.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += data.length;
});
await mkdir(app, { recursive: true });
await writeFile(new URL("favicon.ico", app), Buffer.concat([directory, ...images]));
await writeFile(new URL("icon.png", app), await icon(512));
await writeFile(new URL("apple-icon.png", app), await icon(180));
await writeFile(preview, await icon(256));
console.log("Generated complete-logo favicon (16/32/48/64), app icon (512), and Apple icon (180).");
