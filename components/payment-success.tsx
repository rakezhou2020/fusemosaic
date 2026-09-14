"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./payment-success.module.css";

type PurchaseState = "checking" | "pending" | "paid" | "failed" | "expired" | "missing";

export function PaymentSuccess() {
  const router = useRouter();
  const [state, setState] = useState<PurchaseState>("checking");
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkPurchase = async () => {
      try {
        const response = await fetch("/api/payment/status?latest=1", { cache: "no-store" });
        const result = await response.json() as { status?: PurchaseState; slug?: string };
        if (!active) return;
        if (!response.ok || !result.status || !result.slug) { setState("missing"); return; }
        const purchaseSlug = result.slug;
        setSlug(purchaseSlug);
        setState(result.status);
        if (result.status === "paid") window.setTimeout(() => router.replace(`/patterns/${encodeURIComponent(purchaseSlug)}`), 900);
      } catch {
        if (active) setState("missing");
      }
    };
    void checkPurchase();
    const interval = window.setInterval(() => void checkPurchase(), 1500);
    return () => { active = false; window.clearInterval(interval); };
  }, [router]);

  const patternHref = slug ? `/patterns/${encodeURIComponent(slug)}` : "/chinese";
  const heading = state === "paid" ? "Payment confirmed" : state === "pending" || state === "checking" ? "Confirming your payment" : "Payment status unavailable";
  const text = state === "paid" ? "Your pattern is unlocked. Taking you back to its download page…" : state === "pending" || state === "checking" ? "We are securely confirming your purchase. This page will return you to the pattern as soon as it is ready." : "We could not find a recent purchase in this browser session. Return to your pattern page to try again.";

  return <section className={styles.card} aria-live="polite"><p className="eyebrow">FuseMosaic checkout</p><h1>{heading}</h1><p>{text}</p>{state !== "checking" && <Link href={patternHref}>{state === "paid" ? "Open your pattern now" : "Return to patterns"}</Link>}</section>;
}
