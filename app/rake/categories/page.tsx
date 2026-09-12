import { CategoryManager } from "@/components/rake/category-manager";
import { listCategories } from "@/lib/admin-data";
export default async function AdminCategories(){const categories=await listCategories();return <><h2>Categories</h2><CategoryManager initial={categories} /></>}
