"use client";
import { useState } from "react";
import { analyseFuseBeadChart } from "@/lib/fuse-bead-analysis";

export function UploadForm() {
  const [message, setMessage] = useState("");
  async function upload(form: FormData) {
    const files = form.getAll("files").filter((value): value is File => value instanceof File); const width = Number(form.get("grid_width")); const height = Number(form.get("grid_height"));
    if (!files.length) return; if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) { setMessage("Enter the bead grid width and height first."); return; }
    setMessage("Analysing chart colours…");
    for (const file of files) { try { form.append("color_analysis", JSON.stringify(await analyseFuseBeadChart(file, width, height))); } catch (error) { setMessage(`${file.name}: ${error instanceof Error ? error.message : "Colour analysis failed."} The image will still upload for manual Colors JSON entry.`); } }
    setMessage("Processing images…"); const response=await fetch("/api/rake/uploads",{method:"POST",body:form});const json=await response.json() as { error?:string; patterns?:{id:string}[] };if(!response.ok || !json.patterns?.[0]){setMessage(json.error??"Upload failed.");return;}location.assign(`/rake/patterns/${json.patterns[0].id}`);
  }
  return <form action={upload} className="rake-form"><label>Source image(s)<input name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple required /></label><div className="rake-grid"><label>Grid width<input name="grid_width" type="number" min="1" required /></label><label>Grid height<input name="grid_height" type="number" min="1" required /></label></div><p>Enter only the bead grid dimensions. Colors JSON, total beads and color count are then analysed automatically. JPG, PNG or WebP only; maximum 20 MB per file.</p><p>{message}</p><button>Upload and analyse</button></form>;
}
