"use client";

import { useEffect, useRef, useState } from "react";
import { trackPatternDownload } from "@/lib/analytics";
import styles from "./premium-purchase.module.css";
import { CART_CHANGE_EVENT, CART_KEY, readCart, removeCartItem } from "./header-cart";

type Status = "idle" | "creating" | "pending" | "paid" | "failed" | "expired";

export function PremiumPurchase({ slug, title, category }: { slug: string; title: string; category: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [inCart, setInCart] = useState(false);
  const paymentId = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "pending" || !paymentId.current) return;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(`/api/payment/status?payment_id=${encodeURIComponent(paymentId.current ?? "")}`, { cache: "no-store" });
        const result = await response.json() as { status?: Status };
        if (!active || !result.status) return;
        if (["paid", "failed", "expired"].includes(result.status)) {
          if (result.status === "paid") removeCartItem(slug);
          setStatus(result.status);
        }
      } catch { /* The next polling interval retries a transient network failure. */ }
    };
    void check();
    const interval = window.setInterval(() => void check(), 1500);
    return () => { active = false; window.clearInterval(interval); };
  }, [slug, status]);

  useEffect(() => {
    let active = true;
    const recoverPurchase = async () => {
      try {
        const response = await fetch(`/api/payment/status?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        const result = await response.json() as { status?: Status };
        if (active && response.ok && result.status && ["pending", "paid", "failed", "expired"].includes(result.status)) {
          if (result.status === "paid") removeCartItem(slug);
          setStatus(result.status);
        }
      } catch { /* A missing or expired purchase session simply remains locked. */ }
    };
    void recoverPurchase();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    const refresh = () => setInCart(readCart().some((item) => item.slug === slug));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CART_CHANGE_EVENT, refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener(CART_CHANGE_EVENT, refresh); };
  }, [slug]);

  function addToCart() {
    const items = readCart();
    if (!items.some((item) => item.slug === slug)) window.localStorage.setItem(CART_KEY, JSON.stringify([...items, { slug, title }]));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
    setInCart(true);
  }

  async function beginCheckout() {
    const checkoutWindow = window.open("", "_blank");
    if (checkoutWindow) checkoutWindow.opener = null;
    setStatus("creating");
    try {
      const response = await fetch("/api/payment/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
      const result = await response.json() as { payment_id?: string; checkout_url?: string; error?: string };
      if (!response.ok || !result.payment_id || !result.checkout_url) throw new Error(result.error ?? "Checkout could not be started");
      paymentId.current = result.payment_id;
      setStatus("pending");
      if (checkoutWindow) checkoutWindow.location.assign(result.checkout_url);
      else window.location.assign(result.checkout_url);
    } catch {
      checkoutWindow?.close();
      setStatus("failed");
    }
  }

  if (status === "paid") {
    return <div className={styles.unlocked}><strong>Pattern unlocked</strong><p>Your payment is confirmed. Your build guide is ready.</p><a href={`/api/payment/download/${encodeURIComponent(slug)}`} onClick={() => trackPatternDownload({ slug, title, category, fileType: "pdf", fileName: `${slug}-build-guide.pdf` })}>Download build guide</a></div>;
  }

  return (
    <div className={styles.purchase}>
      <p>Unlock the complete pattern and downloadable build guide.</p>
      <p className={styles.price}>$9.90 <span>· Paid in USDT at checkout</span></p>
      <div className={styles.actions}>
        <button className={styles.cart} type="button" onClick={addToCart} disabled={status === "creating" || status === "pending"}>{inCart ? "In cart" : "Add to cart"}</button>
        <button className={styles.buy} type="button" onClick={() => void beginCheckout()} disabled={status === "creating" || status === "pending"}>{status === "creating" ? "Opening checkout…" : status === "pending" ? "Awaiting payment…" : "Unlock pattern · $9.90"}</button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">{status === "pending" ? "Checkout is open in a new tab. This page will unlock automatically after payment confirmation." : status === "failed" ? "Checkout could not be started. Please try again." : status === "expired" ? "This checkout expired. Start a new one to continue." : ""}</p>
    </div>
  );
}
