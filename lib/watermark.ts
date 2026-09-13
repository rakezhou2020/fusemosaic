const DOWNLOAD_WIDTH = 1600;
const PATTERN_HEIGHT = 2000;
const FOOTER_HEIGHT = 88;
const WATERMARK_PADDING = 28;

export const watermarkedDownloadKey = "download-watermarked.jpg";

const brandCells = ["#da5d4e", "#618ba5", "#d5ab36", "#da5d4e", "#d5ab36", "#618ba5", "#749273", "#d5ab36", "#d5ab36", "#618ba5", "#d5ab36", "#d5ab36", "#da5d4e", "#749273", "#d5ab36", "#da5d4e"];
const glyphs: Record<string, string[]> = {
  f:["01110","01000","11110","01000","01000","01000","01000"], u:["00000","00000","10001","10001","10001","10011","01101"], s:["00000","01111","10000","01110","00001","10001","01110"], e:["00000","01110","10001","11111","10000","10001","01110"], m:["00000","00000","11010","10101","10101","10101","10101"], o:["00000","01110","10001","10001","10001","10001","01110"], a:["00000","00000","01110","00001","01111","10001","01111"], i:["00100","00000","01100","00100","00100","00100","01110"], c:["00000","00000","01110","10001","10000","10001","01110"], ".":["00000","00000","00000","00000","00000","00110","00110"],
};

function crc32(bytes: Uint8Array) {
  let value = 0xffffffff;
  for (const byte of bytes) { value ^= byte; for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0); }
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array) {
  const chunk = new Uint8Array(12 + data.length);
  new DataView(chunk.buffer).setUint32(0, data.length);
  chunk.set(new TextEncoder().encode(type), 4); chunk.set(data, 8);
  new DataView(chunk.buffer).setUint32(8 + data.length, crc32(chunk.slice(4, 8 + data.length)));
  return chunk;
}

async function watermarkPng() {
  const width = 288; const height = 58; const pixels = new Uint8Array(width * height * 4);
  const fill = (x: number, y: number, w: number, h: number, hex: string) => {
    const rgb = [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
    for (let row = Math.max(0, y); row < Math.min(height, y + h); row += 1) for (let column = Math.max(0, x); column < Math.min(width, x + w); column += 1) {
      const offset = (row * width + column) * 4; pixels.set([...rgb, 255], offset);
    }
  };
  brandCells.forEach((color, index) => fill(4 + (index % 4) * 10, 9 + Math.floor(index / 4) * 10, 8, 8, color));
  [..."fusemosaic.com"].forEach((letter, letterIndex) => (glyphs[letter] ?? glyphs["."]).forEach((row, rowIndex) => [...row].forEach((on, columnIndex) => {
    if (on === "1") fill(52 + letterIndex * 16 + columnIndex * 2, 22 + rowIndex * 2, 2, 2, "#24231f");
  })));
  const scanlines = new Uint8Array(height * (1 + width * 4));
  for (let row = 0; row < height; row += 1) scanlines[row * (1 + width * 4)] = 0;
  for (let row = 0; row < height; row += 1) scanlines.set(pixels.slice(row * width * 4, (row + 1) * width * 4), row * (1 + width * 4) + 1);
  const compressed = new Response(new Blob([scanlines]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer();
  const ihdr = new Uint8Array(13); const view = new DataView(ihdr.buffer); view.setUint32(0, width); view.setUint32(4, height); ihdr.set([8, 6, 0, 0, 0], 8);
  const joined = (parts: Uint8Array[]) => { const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0; for (const part of parts) { result.set(part, offset); offset += part.length; } return result; };
  return joined([new Uint8Array([137,80,78,71,13,10,26,10]), pngChunk("IHDR", ihdr), pngChunk("IDAT", new Uint8Array(await compressed)), pngChunk("IEND", new Uint8Array())]);
}

export function watermarkDimensions(imageWidth = DOWNLOAD_WIDTH) {
  const width = Math.min(Math.round(imageWidth * 0.18), Math.round(imageWidth * 0.2), 320);
  return { width: Math.max(180, width), height: Math.round(Math.max(180, width) / 5) };
}

/** Generates the final, static JPG once. The SVG overlay has no background. */
export async function createWatermarkedDownload(images: ImagesBinding, source: ArrayBuffer) {
  const watermark = watermarkDimensions();
  const overlay = await images.input(new Blob([await watermarkPng()], { type: "image/png" }).stream())
    .transform({ width: watermark.width, height: watermark.height, fit: "contain" })
    .output({ format: "image/png", anim: false });
  const result = await images.input(new Blob([source]).stream())
    .transform({ width: DOWNLOAD_WIDTH, height: PATTERN_HEIGHT, fit: "contain", background: "#ffffff" })
    .transform({ width: DOWNLOAD_WIDTH, height: PATTERN_HEIGHT + FOOTER_HEIGHT, fit: "pad", gravity: "top", background: "#ffffff" })
    .draw(overlay.image(), { right: WATERMARK_PADDING, bottom: Math.round((FOOTER_HEIGHT - watermark.height) / 2), opacity: 0.82 })
    .output({ format: "image/jpeg", quality: 90, anim: false });
  const response = result.response();
  if (!response.ok || !response.body) throw new Error("Watermarked image transformation failed");
  return response;
}
