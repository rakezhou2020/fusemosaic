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
  downloadImage: string;
  downloadPdf: string;
  gridWidth: number;
  gridHeight: number;
  colors: PatternColor[];
  totalBeads: number;
  difficulty: Difficulty;
  estimatedSize: string;
  featured: boolean;
  status: "published" | "coming-soon";
  art: ArtVariant;
};

export type ArtVariant =
  | "deer"
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

const deerColors: PatternColor[] = [
  { code: "A", name: "Golden Brown", hex: "#CB991C", beads: 154 },
  { code: "B", name: "Brown", hex: "#8D7452", beads: 75 },
  { code: "C", name: "Taupe", hex: "#AA926A", beads: 133 },
  { code: "D", name: "Cream", hex: "#FDEEB9", beads: 691 },
  { code: "E", name: "Olive", hex: "#C4B187", beads: 167 },
  { code: "F", name: "Soft Gold", hex: "#DFCD9D", beads: 207 },
  { code: "G", name: "Burnished Gold", hex: "#B48130", beads: 25 },
  { code: "H", name: "Leaf Green", hex: "#6B9555", beads: 26 },
  { code: "I", name: "Brick Red", hex: "#B25B42", beads: 25 },
  { code: "J", name: "Teal", hex: "#16A49E", beads: 32 },
  { code: "K", name: "Warm Gray", hex: "#928097", beads: 44 },
  { code: "L", name: "Coral Red", hex: "#E45247", beads: 42 },
  { code: "M", name: "Mauve", hex: "#9F7ECC", beads: 29 },
  { code: "N", name: "Sky Blue", hex: "#87BCCD", beads: 11 },
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
    slug: "celestial-deer",
    title: "Celestial Deer Fuse Bead Pattern",
    category: "Fantasy",
    categorySlug: "fantasy",
    description:
      "A graceful celestial deer with a warm ivory body, golden antlers, and a jewel-toned mosaic saddle. Built as a detailed large-format pattern.",
    previewImage: "/images/patterns/celestial-deer-large-preview.webp",
    downloadImage: "/downloads/celestial-deer-pattern.jpg",
    downloadPdf: "/downloads/celestial-deer-pattern.pdf",
    gridWidth: 64,
    gridHeight: 90,
    colors: deerColors,
    totalBeads: 1661,
    difficulty: "Intermediate",
    estimatedSize: "32 × 45 cm with 5 mm beads",
    featured: true,
    status: "published",
    art: "deer",
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
