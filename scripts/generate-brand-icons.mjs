import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Use the original artwork, including its lettering; do not redraw the brand.
const source = new URL("../public/brand/wearables-by-ashabi.png", import.meta.url);
const app = new URL("../src/app/", import.meta.url);
const preview = new URL("../public/brand/favicon-preview.png", import.meta.url);
const background = { r: 48, g: 55, b: 43, alpha: 1 };
const artwork = await sharp(await readFile(source)).trim().png().toBuffer();

async function icon(size) {
  const inset = Math.max(1, Math.round(size * 0.06));
  const logo = await sharp(artwork)
    .resize(size - inset * 2, size - inset * 2, { fit: "inside" })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

// PNG payloads in an ICO directory support crisp tab icons at each native size.
const sizes = [16, 32, 48];
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
console.log("Generated original-logo favicon (16/32/48), app icon (512), and Apple icon (180).");
