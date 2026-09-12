import { UploadForm } from "@/components/rake/upload-form";
import { requireAdminPage } from "@/lib/admin-auth";
export default async function NewPattern() { await requireAdminPage(); return <><h2>Upload patterns</h2><UploadForm /></>; }
