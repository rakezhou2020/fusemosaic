import { notFound } from "next/navigation";
import { PatternEditor } from "@/components/rake/pattern-editor";
import { getAdminPattern, listCategories } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/admin-auth";
export default async function EditPattern({ params }: { params: Promise<{ id:string }> }) { await requireAdminPage(); const pattern=await getAdminPattern((await params).id); if(!pattern)notFound(); return <><h2>Edit pattern</h2><PatternEditor pattern={pattern} categories={(await listCategories()).map(({id,name})=>({id,name}))} /></>; }
