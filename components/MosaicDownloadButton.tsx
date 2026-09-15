"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fileTypeFromName, trackPatternDownload } from "@/lib/analytics";
import styles from "./MosaicDownloadButton.module.css";

const BRAND_COLORS = ["#ed5c50", "#3a91c6", "#f4c430", "#68a66b"];
type Phase = "idle" | "loading" | "settling" | "complete";

function defaultCells(columns: number) {
  return Array.from({ length: columns * 3 }, (_, index) => {
    let value = Math.imul(index + columns * 19 + 1, 0x45d9f3b);
    value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
    return ((value ^ (value >>> 16)) >>> 0) % BRAND_COLORS.length;
  });
}

function orderedCells(columns: number) {
  return Array.from({ length: columns * 3 }, (_, index) => {
    const column = index % columns;
    return Math.min(BRAND_COLORS.length - 1, Math.floor((column * BRAND_COLORS.length) / columns));
  });
}

function shuffledCells(columns: number) {
  return Array.from({ length: columns * 3 }, () => Math.floor(Math.random() * BRAND_COLORS.length));
}

function useVisibleColumns() {
  const [columns, setColumns] = useState(12);

  useEffect(() => {
    const tablet = window.matchMedia("(max-width: 900px)");
    const mobile = window.matchMedia("(max-width: 560px)");
    const update = () => setColumns(mobile.matches ? 8 : tablet.matches ? 10 : 12);
    update();
    tablet.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      tablet.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  return columns;
}

export function MosaicDownloadButton({ href, filename, pattern }: { href: string; filename: string; pattern: { slug: string; title: string; category: string } }) {
  const columns = useVisibleColumns();
  const idleCells = useMemo(() => defaultCells(columns), [columns]);
  const completeCells = useMemo(() => orderedCells(columns), [columns]);
  const [cells, setCells] = useState(() => defaultCells(12));
  const [phase, setPhase] = useState<Phase>("idle");
  const [reducedMotion, setReducedMotion] = useState(false);
  const pendingDownload = useRef<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = window.setInterval(() => setCells(shuffledCells(columns)), reducedMotion ? 160 : 85);
    return () => window.clearInterval(interval);
  }, [columns, phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "settling") return;
    let settledColumns = 0;
    const step = reducedMotion ? 3 : 1;
    const interval = window.setInterval(() => {
      settledColumns = Math.min(columns, settledColumns + step);
      setCells((previous) => previous.map((color, index) => {
        const column = index % columns;
        return column >= columns - settledColumns ? completeCells[index] : color;
      }));
      if (settledColumns === columns) {
        window.clearInterval(interval);
        setPhase("complete");
      }
    }, reducedMotion ? 50 : 95);
    return () => window.clearInterval(interval);
  }, [columns, completeCells, phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "complete") return;
    const url = pendingDownload.current;
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      pendingDownload.current = null;
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  }, [filename, phase]);

  useEffect(() => () => {
    if (pendingDownload.current) URL.revokeObjectURL(pendingDownload.current);
  }, []);

  async function downloadPattern() {
    if (phase === "loading" || phase === "settling") return;
    trackPatternDownload({ ...pattern, fileType: fileTypeFromName(filename), fileName: filename });
    setPhase("loading");
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error(`Download failed with status ${response.status}`);
      pendingDownload.current = URL.createObjectURL(await response.blob());
      setPhase("settling");
    } catch {
      setPhase("idle");
    }
  }

  return (
    <button className={styles.button} type="button" onClick={downloadPattern} disabled={phase === "loading" || phase === "settling"} aria-label="Download free JPG pattern" aria-busy={phase === "loading" || phase === "settling"}>
      <span className={styles.label} aria-hidden="true">Download JPG</span>
      <span className={styles.strip} aria-hidden="true">
        {(phase === "idle" ? idleCells : cells).map((color, index) => (
          <span className={`${styles.cell} ${phase === "loading" || phase === "settling" ? styles.moving : ""}`} key={`${columns}-${index}`} style={{ backgroundColor: BRAND_COLORS[color] }} />
        ))}
      </span>
      <span className={styles.status} role="status" aria-live="polite">{phase === "loading" ? "Preparing download" : phase === "settling" ? "Download ready" : phase === "complete" ? "Download started" : ""}</span>
    </button>
  );
}
