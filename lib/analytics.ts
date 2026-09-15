export type PatternDownloadEvent = {
  slug: string;
  title: string;
  fileType: string;
  fileName: string;
  category: string;
  pagePath?: string;
};

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, parameters: Record<string, string>) => void;
  }
}

/** Records a download attempt without ever blocking the download itself. */
export function trackPatternDownload({ slug, title, fileType, fileName, category, pagePath }: PatternDownloadEvent) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  try {
    window.gtag("event", "pattern_download", {
      pattern_slug: slug,
      pattern_title: title,
      file_type: fileType.toLowerCase(),
      file_name: fileName,
      category,
      page_path: pagePath ?? window.location.pathname,
    });
  } catch {
    // Analytics blockers and transient GA failures must never affect downloads.
  }
}

export function fileTypeFromName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "unknown";
}
