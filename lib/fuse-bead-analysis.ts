import { fuseBeadPalette } from "@/lib/fuse-bead-palette";

export type AnalysedColor = { code: string; hex: string; beads: number };
export type ColourAnalysis = { gridWidth: number; gridHeight: number; colors: AnalysedColor[]; totalBeads: number };

type Lab = [number, number, number];
type Layout = { left: number; top: number; cellWidth: number; cellHeight: number };

const hexToRgb = (hex: string): [number, number, number] => [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
function rgbToLab([red, green, blue]: [number, number, number]): Lab {
  const linear = [red, green, blue].map((value) => { const channel = value / 255; return channel > 0.04045 ? ((channel + 0.055) / 1.055) ** 2.4 : channel / 12.92; });
  const x = (linear[0] * 0.4124 + linear[1] * 0.3576 + linear[2] * 0.1805) / 0.95047;
  const y = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  const z = (linear[0] * 0.0193 + linear[1] * 0.1192 + linear[2] * 0.9505) / 1.08883;
  const pivot = (value: number) => value > 0.008856 ? value ** (1 / 3) : 7.787 * value + 16 / 116;
  const [fx, fy, fz] = [pivot(x), pivot(y), pivot(z)]; return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const distance = (a: Lab, b: Lab) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const palette = fuseBeadPalette.map((color) => ({ ...color, lab: rgbToLab(hexToRgb(color.hex)) }));

function profile(image: ImageData, horizontal: boolean) {
  const { width, height, data } = image; const primary = horizontal ? height : width; const secondary = horizontal ? width : height; const values = Array.from({ length: primary }, () => 0);
  for (let index = 1; index < primary - 1; index += 1) { let total = 0; let samples = 0; for (let other = 0; other < secondary; other += 4) { const first = horizontal ? ((index * width + other) * 4) : ((other * width + index) * 4); const previous = horizontal ? (((index - 1) * width + other) * 4) : ((other * width + index - 1) * 4); total += Math.abs(data[first] - data[previous]) + Math.abs(data[first + 1] - data[previous + 1]) + Math.abs(data[first + 2] - data[previous + 2]); samples += 1; } values[index] = total / Math.max(samples, 1); }
  return values;
}

function gridLayout(image: ImageData, columns: number, rows: number): Layout | null {
  const vertical = profile(image, false); const horizontal = profile(image, true);
  const find = (values: number[], cells: number) => { let best: { offset: number; size: number; score: number } | null = null; const min = values.length / (cells + 6); const max = values.length / Math.max(cells - 1, 1); for (let size = min; size <= max; size += 0.5) for (let offset = 0; offset <= values.length * 0.12; offset += 1) { let score = 0; for (let index = 0; index <= cells; index += 1) { const point = Math.round(offset + index * size); if (point >= 0 && point < values.length) score += values[point]; } if (!best || score > best.score) best = { offset, size, score }; } return best; };
  const x = find(vertical, columns); const y = find(horizontal, rows); if (!x || !y || x.size < 3 || y.size < 3) return null;
  return { left: x.offset, top: y.offset, cellWidth: x.size, cellHeight: y.size };
}

function matchCell(image: ImageData, layout: Layout, column: number, row: number) {
  const picks: string[] = []; const errors: number[] = []; const offsets = [[0.22, 0.22], [0.78, 0.22], [0.22, 0.78], [0.78, 0.78], [0.5, 0.22]];
  for (const [xOffset, yOffset] of offsets) { const x = Math.max(0, Math.min(image.width - 1, Math.round(layout.left + (column + xOffset) * layout.cellWidth))); const y = Math.max(0, Math.min(image.height - 1, Math.round(layout.top + (row + yOffset) * layout.cellHeight))); const index = (y * image.width + x) * 4; const lab = rgbToLab([image.data[index], image.data[index + 1], image.data[index + 2]]); const nearest = palette.reduce((best, color) => distance(lab, color.lab) < best.error ? { color, error: distance(lab, color.lab) } : best, { color: palette[0], error: Infinity }); picks.push(nearest.color.code); errors.push(nearest.error); }
  const code = [...new Set(picks)].sort((a, b) => picks.filter((value) => value === b).length - picks.filter((value) => value === a).length)[0]; return { code, error: errors.reduce((sum, value) => sum + value, 0) / errors.length };
}

export async function analyseFuseBeadChart(source: Blob, gridWidth: number, gridHeight: number): Promise<ColourAnalysis> {
  if (!Number.isInteger(gridWidth) || !Number.isInteger(gridHeight) || gridWidth < 1 || gridHeight < 1) throw new Error("Enter valid grid width and height before analysing colours.");
  const bitmap = await createImageBitmap(source); const maximum = 1800; const scale = Math.min(1, maximum / Math.max(bitmap.width, bitmap.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale); const context = canvas.getContext("2d", { willReadFrequently: true }); if (!context) throw new Error("Colour analysis is not supported in this browser."); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close(); const image = context.getImageData(0, 0, canvas.width, canvas.height); const layout = gridLayout(image, gridWidth, gridHeight); if (!layout) throw new Error("The grid area could not be detected.");
  const counts = new Map<string, number>(); let error = 0; for (let row = 0; row < gridHeight; row += 1) for (let column = 0; column < gridWidth; column += 1) { const cell = matchCell(image, layout, column, row); counts.set(cell.code, (counts.get(cell.code) ?? 0) + 1); error += cell.error; }
  if (error / (gridWidth * gridHeight) > 26) throw new Error("The chart colours could not be matched confidently. Please enter Colors JSON manually.");
  const colors = palette.filter((color) => counts.has(color.code)).map((color) => ({ code: color.code, hex: color.hex, beads: counts.get(color.code) ?? 0 })); const totalBeads = colors.reduce((sum, color) => sum + color.beads, 0); if (totalBeads !== gridWidth * gridHeight) throw new Error("The detected colour count does not match the grid."); return { gridWidth, gridHeight, colors, totalBeads };
}
