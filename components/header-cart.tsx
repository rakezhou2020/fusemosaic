"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./header-cart.module.css";

export type CartItem = { slug: string; title?: string };

export const CART_KEY = "fusemosaic-cart";
export const CART_CHANGE_EVENT = "fusemosaic-cart-changed";

export function readCart(): CartItem[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as unknown;
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value.flatMap((item) => {
      const entry = typeof item === "string" ? { slug: item } : item;
      if (!entry || typeof entry !== "object" || typeof entry.slug !== "string" || !entry.slug || seen.has(entry.slug)) return [];
      seen.add(entry.slug);
      return [{ slug: entry.slug, title: typeof entry.title === "string" ? entry.title : undefined }];
    });
  } catch {
    return [];
  }
}

function itemTitle(item: CartItem) {
  return item.title || item.slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function HeaderCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<"idle" | "creating" | "pending" | "paid" | "failed">("idle");
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => setItems(readCart());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CART_CHANGE_EVENT, refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener(CART_CHANGE_EVENT, refresh); };
  }, []);

  useEffect(() => {
    if (!open || items.length !== 1 || checkoutState === "paid") return;
    let active = true;
    const reconcile = async () => {
      try {
        const response = await fetch(`/api/payment/status?slug=${encodeURIComponent(items[0].slug)}`, { cache: "no-store" });
        const result = await response.json() as { status?: "pending" | "paid" | "expired" | "failed" };
        if (!active || !response.ok || !result.status) return;
        if (result.status === "paid") setCheckoutState("paid");
        else if (result.status === "pending") setCheckoutState("pending");
      } catch { /* Reconciliation will retry while the cart remains open. */ }
    };
    void reconcile();
    const interval = window.setInterval(() => void reconcile(), 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [checkoutState, items, open]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOnOutsidePointer); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  function removeItem(slug: string) {
    const next = items.filter((item) => item.slug !== slug);
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }

  async function beginCheckout(item: CartItem) {
    // Open synchronously so browser popup protections do not block the provider checkout.
    const checkoutWindow = window.open("", "_blank");
    if (checkoutWindow) checkoutWindow.opener = null;
    setCheckoutState("creating");
    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug }),
      });
      const result = await response.json() as { checkout_url?: string; error?: string };
      if (!response.ok || !result.checkout_url) throw new Error(result.error ?? "Checkout could not be started");
      setCheckoutState("pending");
      if (checkoutWindow) checkoutWindow.location.assign(result.checkout_url);
      else window.location.assign(result.checkout_url);
    } catch {
      checkoutWindow?.close();
      setCheckoutState("failed");
    }
  }

  return (
    <div className={styles.cart} ref={menu}>
      <button className={styles.trigger} type="button" aria-label={`Shopping cart, ${items.length} item${items.length === 1 ? "" : "s"}`} aria-expanded={open} aria-controls="site-cart" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">Bag</span><span className={styles.count}>{items.length}</span>
      </button>
      {open ? <section className={styles.panel} id="site-cart" aria-label="Shopping cart">
        <div className={styles.heading}><strong>Your cart</strong><span>{items.length} item{items.length === 1 ? "" : "s"}</span></div>
        {items.length ? <>
          <ul>{items.map((item) => <li key={item.slug}><div><Link href={`/patterns/${encodeURIComponent(item.slug)}`} onClick={() => setOpen(false)}>{itemTitle(item)}</Link><span>$0.99 · USDT</span></div><button type="button" onClick={() => removeItem(item.slug)} aria-label={`Remove ${itemTitle(item)} from cart`}>Remove</button></li>)}</ul>
          <div className={styles.checkout}>
            {items.length === 1 && checkoutState !== "paid" ? <button type="button" onClick={() => void beginCheckout(items[0])} disabled={checkoutState === "creating" || checkoutState === "pending"}>
              {checkoutState === "creating" ? "Opening checkout…" : checkoutState === "pending" ? "Awaiting payment…" : "Checkout · $0.99"}
            </button> : <p>Each Premium pattern has its own secure checkout. Select an item to purchase it.</p>}
            {checkoutState === "paid" ? <Link className={styles.download} href={`/patterns/${encodeURIComponent(items[0].slug)}`} onClick={() => setOpen(false)}>Payment confirmed · Download pattern</Link> : null}
            {checkoutState === "pending" ? <p role="status">Checkout is open in a new tab. This item remains in your cart until you remove it.</p> : null}
            {checkoutState === "failed" ? <p role="status">Checkout could not be started. Please try again.</p> : null}
          </div>
        </> : <p className={styles.empty}>Your cart is empty. Add a premium pattern to save it here.</p>}
      </section> : null}
    </div>
  );
}
