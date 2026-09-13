export type Difficulty = "Beginner" | "Easy" | "Intermediate" | "Advanced";

export type PatternColor = {
  code: string;
  name: string;
  hex: string;
  beads: number;
};

export type Pattern = {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  description: string;
  previewImage: string;
  detailImage?: string;
  downloadImage: string;
  downloadPdf: string;
  gridWidth: number;
  gridHeight: number;
  colors: PatternColor[];
  totalBeads: number;
  difficulty: Difficulty;
  estimatedSize: string;
  featured: boolean;
  rightsStatus?: "original" | "public-domain" | "fan-made" | "licensed" | "review";
  franchise?: string;
  rightsNote?: string;
  status: "published" | "coming-soon";
  art: ArtVariant;
};

export type ArtVariant =
  | "dragon"
  | "phoenix"
  | "fox"
  | "flower"
  | "moth"
  | "berry"
  | "mushroom"
  | "dinosaur"
  | "lantern";

export type Category = {
  slug: string;
  name: string;
  description: string;
  count: number;
  art: ArtVariant;
  size: "large" | "wide" | "tall" | "standard";
};

const sharedColors: PatternColor[] = [
  { code: "A", name: "Charcoal", hex: "#2a2926", beads: 86 },
  { code: "B", name: "Warm White", hex: "#f4ebd1", beads: 214 },
  { code: "C", name: "Vermilion", hex: "#d95f4b", beads: 72 },
  { code: "D", name: "Ochre", hex: "#d4a62a", beads: 55 },
  { code: "E", name: "Sage", hex: "#6f916f", beads: 48 },
  { code: "F", name: "Slate Blue", hex: "#5987a6", beads: 41 },
];

const taotieColors: PatternColor[] = [
  { code: "A", name: "Outline Black", hex: "#101712", beads: 1735 },
  { code: "B", name: "Dark Green", hex: "#075339", beads: 624 },
  { code: "C", name: "Forest Green", hex: "#126447", beads: 823 },
  { code: "D", name: "Grass Green", hex: "#8CAB3F", beads: 1176 },
  { code: "E", name: "Light Green", hex: "#B5C95C", beads: 32 },
  { code: "F", name: "Vermilion", hex: "#EE2815", beads: 415 },
  { code: "G", name: "Orange", hex: "#FF851B", beads: 214 },
  { code: "H", name: "Dark Red", hex: "#830E14", beads: 45 },
  { code: "I", name: "Bright Yellow", hex: "#FFF044", beads: 66 },
  { code: "J", name: "Cream Yellow", hex: "#FFE797", beads: 207 },
  { code: "K", name: "Brown", hex: "#855738", beads: 272 },
  { code: "L", name: "Khaki", hex: "#C5AF67", beads: 90 },
];

const mock = (
  slug: string,
  title: string,
  category: string,
  categorySlug: string,
  art: ArtVariant,
  gridWidth: number,
  gridHeight: number,
  difficulty: Difficulty,
  featured = false,
): Pattern => ({
  slug,
  title,
  category,
  categorySlug,
  description: `A clean, printable ${title.toLowerCase()} designed for a satisfying afternoon build.`,
  previewImage: "",
  downloadImage: "#",
  downloadPdf: "#",
  gridWidth,
  gridHeight,
  colors: sharedColors,
  totalBeads: Math.round(gridWidth * gridHeight * 0.43),
  difficulty,
  estimatedSize: `${(gridWidth * 0.5).toFixed(1)} × ${(gridHeight * 0.5).toFixed(1)} cm with 5 mm beads`,
  featured,
  status: "published",
  art,
});

export const patterns: Pattern[] = [
  {
    slug: "taotie",
    title: "Taotie Fuse Bead Pattern",
    category: "Chinese Style",
    categorySlug: "chinese-style",
    description: "An original Taotie, rebuilt as a subject-only 120 × 110 fuse bead mosaic. The English printable chart includes an overview, color key, counts, and nine coordinate sections.",
    previewImage: "/images/patterns/taotie-finished-photo.png",
    detailImage: "/images/patterns/taotie-chart-detail.png",
    downloadImage: "#",
    downloadPdf: "/downloads/taotie-bead-pattern.pdf",
    gridWidth: 120,
    gridHeight: 110,
    colors: taotieColors,
    totalBeads: 5699,
    difficulty: "Advanced",
    estimatedSize: "60 × 55 cm with 5 mm beads",
    featured: false,
    rightsStatus: "original",
    status: "published",
    art: "phoenix",
  },
  mock("moonlit-dragon", "Moonlit Dragon Pattern", "Fantasy", "fantasy", "dragon", 38, 34, "Intermediate", true),
  mock("paper-cut-phoenix", "Paper-cut Phoenix Pattern", "Chinese Style", "chinese-style", "phoenix", 42, 38, "Intermediate", true),
  mock("woodland-fox", "Woodland Fox Pattern", "Animals", "animals", "fox", 26, 24, "Easy", true),
  mock("garden-tulip", "Garden Tulip Pattern", "Flowers", "flowers", "flower", 20, 28, "Beginner"),
  mock("luna-moth", "Luna Moth Pattern", "Animals", "animals", "moth", 30, 24, "Easy"),
  mock("summer-strawberry", "Summer Strawberry Pattern", "Food", "food", "berry", 18, 20, "Beginner"),
  mock("forest-mushroom", "Forest Mushroom Pattern", "Food", "food", "mushroom", 22, 22, "Beginner"),
  mock("tiny-triceratops", "Tiny Triceratops Pattern", "Dinosaurs", "dinosaurs", "dinosaur", 28, 20, "Easy"),
  mock("festival-lantern", "Festival Lantern Pattern", "Chinese Style", "chinese-style", "lantern", 24, 32, "Easy"),
];

export const categories: Category[] = [
  { slug: "animals", name: "Animals", description: "Wildlife, pets, woodland creatures and ocean life.", count: 82, art: "fox", size: "large" },
  { slug: "flowers", name: "Flowers", description: "Graphic blooms and botanical studies.", count: 38, art: "flower", size: "wide" },
  { slug: "fantasy", name: "Fantasy", description: "Dragons, celestial beings and storybook creatures.", count: 51, art: "dragon", size: "tall" },
  { slug: "food", name: "Food", description: "Fruit, sweets and tiny kitchen favorites.", count: 34, art: "berry", size: "standard" },
  { slug: "dinosaurs", name: "Dinosaurs", description: "Prehistoric silhouettes for compact boards.", count: 19, art: "dinosaur", size: "standard" },
  { slug: "christmas", name: "Christmas", description: "Ornaments, winter icons and festive motifs.", count: 45, art: "moth", size: "wide" },
  { slug: "halloween", name: "Halloween", description: "Moody seasonal projects and curious creatures.", count: 27, art: "mushroom", size: "standard" },
  { slug: "chinese-style", name: "Chinese Style", description: "Traditional forms reinterpreted as bead mosaics.", count: 24, art: "phoenix", size: "wide" },
];

export const getPattern = (slug: string) => patterns.find((pattern) => pattern.slug === slug);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);
export const patternsByCategory = (slug: string) => patterns.filter((pattern) => pattern.categorySlug === slug);
