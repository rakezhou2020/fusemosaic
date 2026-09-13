export type FuseBeadColor = { code: string; hex: string };

// The current FuseMosaic chart palette. Extend this single source of truth as
// additional supplier colour codes are approved.
export const fuseBeadPalette: FuseBeadColor[] = [
  { code: "H2", hex: "#F4F1E8" }, { code: "A22", hex: "#FFE47A" },
  { code: "B8", hex: "#098B45" }, { code: "B14", hex: "#B5E53A" },
  { code: "A7", hex: "#FF7821" }, { code: "A14", hex: "#FF5536" },
  { code: "B17", hex: "#9AAF2A" }, { code: "B9", hex: "#064C2D" },
  { code: "B2", hex: "#6DDF3D" }, { code: "B11", hex: "#788534" },
  { code: "B5", hex: "#46CA52" }, { code: "A4", hex: "#FFD13D" },
  { code: "B13", hex: "#C8EC73" }, { code: "A13", hex: "#FFAD43" },
  { code: "A26", hex: "#FFB63A" }, { code: "G6", hex: "#FF983D" },
];
