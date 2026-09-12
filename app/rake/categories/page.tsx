import { CategoryManager } from "@/components/rake/category-manager";
import { listCategories } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/admin-auth";
export default async function AdminCategories(){await requireAdminPage();const categories=await listCategories();return <><h2>Categories</h2><CategoryManager initial={categories} /></>}
