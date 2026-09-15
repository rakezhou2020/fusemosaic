import { getFuseMosaicEnv } from "@/lib/cloudflare";
import { categories as fallbackCategories, patterns as fallbackPatterns, type ArtVariant, type Category, type Pattern } from "@/data/patterns";

const art: Record<string, ArtVariant> = {
  animals: "fox",
  people: "person",
  "food-drinks": "bowl",
  food: "bowl",
  fruits: "apple",
  fruit: "apple",
  sports: "ball",
  holidays: "tree",
  christmas: "tree",
  "culture-fantasy": "castle",
  fantasy: "dragon",
  "chinese-collection": "phoenix",
  "traditional-culture": "lantern",
  decorations: "moth",
  "large-patterns": "dragon",
  flowers: "flower",
  other: "moth",
};
type Row = { id:string; slug:string; title:string; description:string; preview_url:string|null; detail_url:string|null; download_url:string|null; pdf_url:string|null; access_type:string|null; grid_width:number|null; grid_height:number|null; colors:string; total_beads:number|null; difficulty:string|null; estimated_size:string|null; featured:number; category_name:string|null; category_slug:string|null; seo_title:string|null; seo_description:string|null; content_rights_status:string|null; franchise:string|null; rights_note:string|null; status:string; updated_at:string|null; published_at:string|null };
function map(row: Row): Pattern { let colors: Pattern["colors"]=[]; try { colors=JSON.parse(row.colors) as Pattern["colors"]; } catch {} return { slug:row.slug,title:row.title,category:row.category_name??"Other",categorySlug:row.category_slug??"other",description:row.description,previewImage:row.preview_url??"",detailImage:row.detail_url??undefined,downloadImage:row.download_url??"#",downloadPdf:row.pdf_url??"#",gridWidth:row.grid_width??0,gridHeight:row.grid_height??0,colors,totalBeads:row.total_beads??0,difficulty:(row.difficulty as Pattern["difficulty"])||"Beginner",estimatedSize:row.estimated_size??"",access:row.access_type === "paid" ? "paid" : "free",featured:Boolean(row.featured),rightsStatus:row.content_rights_status as Pattern["rightsStatus"],franchise:row.franchise??undefined,rightsNote:row.rights_note??undefined,lastModified:row.updated_at??row.published_at??undefined,status:"published",art:art[row.category_slug??"other"]??"flower" }; }
function database() { return getFuseMosaicEnv().PATTERNS_DB; }
const published = "p.status='published' AND p.rights_status='approved'";
export async function publicPatterns(query?: string) { const db=database(); const matches=(p:Pattern)=>!query || `${p.title} ${p.category} ${p.difficulty} ${p.description}`.toLowerCase().includes(query.toLowerCase()); if(!db) return fallbackPatterns.filter((p)=>p.access === "free" && matches(p)); const search=query?" AND (p.title LIKE ? OR p.description LIKE ? OR c.name LIKE ?)":""; const args=query?[`%${query}%`,`%${query}%`,`%${query}%`]:[]; const result=await db.prepare(`SELECT p.*,c.name category_name,c.slug category_slug FROM patterns p LEFT JOIN categories c ON c.id=p.category_id WHERE ${published} AND p.access_type='free'${search} ORDER BY p.featured DESC,p.published_at DESC`).bind(...args).all<Row>(); return result.results.map(map); }
export async function publicChineseCollection() { const db=database(); if(!db) return fallbackPatterns.filter((p)=>p.categorySlug === "chinese-collection"); const result=await db.prepare(`SELECT p.*,c.name category_name,c.slug category_slug FROM patterns p LEFT JOIN categories c ON c.id=p.category_id WHERE ${published} AND c.slug='chinese-collection' ORDER BY p.published_at DESC`).all<Row>(); return result.results.map(map); }
export async function publicPattern(slug:string) { const db=database(); if(!db)return fallbackPatterns.find((p)=>p.slug===slug); const row=await db.prepare(`SELECT p.*,c.name category_name,c.slug category_slug FROM patterns p LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=? AND ${published}`).bind(slug).first<Row>(); return row?map(row):undefined; }
export async function publicCategories() { const db=database(); if(!db)return fallbackCategories; const result=await db.prepare(`SELECT c.*,COUNT(p.id) count FROM categories c LEFT JOIN patterns p ON p.category_id=c.id AND ${published} AND p.access_type='free' WHERE c.status='active' AND c.slug!='chinese-collection' GROUP BY c.id HAVING count>0 ORDER BY c.sort_order,c.name`).all<{slug:string;name:string;description:string;count:number;updated_at:string|null}>(); return result.results.map((c):Category=>({ ...c, art:art[c.slug]??"moth", size:"standard", lastModified:c.updated_at??undefined })); }
export async function publicCategory(slug:string) { return (await publicCategories()).find((category)=>category.slug===slug); }
export async function publicPatternsByCategory(slug:string) { return (await publicPatterns()).filter((pattern)=>pattern.categorySlug===slug); }
