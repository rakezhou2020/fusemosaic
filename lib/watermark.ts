const DOWNLOAD_WIDTH = 1600;
const PATTERN_HEIGHT = 2000;
const FOOTER_HEIGHT = 88;
const WATERMARK_PADDING = 28;

export const watermarkedDownloadKey = "download-watermarked.jpg";

const brandCells = [
  "#da5d4e", "#618ba5", "#d5ab36", "#da5d4e",
  "#d5ab36", "#618ba5", "#749273", "#d5ab36",
  "#d5ab36", "#618ba5", "#d5ab36", "#d5ab36",
  "#da5d4e", "#749273", "#d5ab36", "#da5d4e",
];

function watermarkSvg() {
  const icon = brandCells.map((color, index) => {
    const x = (index % 4) * 48;
    const y = Math.floor(index / 4) * 48;
    return `<rect x="${x}" y="${y}" width="38" height="38" rx="5" fill="${color}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="192" viewBox="0 0 960 192"><g>${icon}</g><text x="232" y="123" fill="#24231f" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="700" letter-spacing="-2">fusemosaic.com</text></svg>`;
}

export function watermarkDimensions(imageWidth = DOWNLOAD_WIDTH) {
  const width = Math.min(Math.round(imageWidth * 0.18), Math.round(imageWidth * 0.2), 320);
  return { width: Math.max(180, width), height: Math.round(Math.max(180, width) / 5) };
}

/** Generates the final, static JPG once. The SVG overlay has no background. */
export async function createWatermarkedDownload(images: ImagesBinding, source: ArrayBuffer) {
  const watermark = watermarkDimensions();
  const overlay = await images.input(new Blob([watermarkSvg()], { type: "image/svg+xml" }).stream())
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
