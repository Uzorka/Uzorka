import type { Metadata } from "next";

import { PageBar } from "@/components/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Basket" };

/**
 * The basket is empty until the cart store lands in the next milestone — the
 * storefront is read-only for now, so this is the honest state rather than a
 * fake one.
 */
export default function BasketPage() {
  return (
    <main>
      <PageBar title="Your basket" backHref="/shop" />
      <div className="px-4.5 pt-[86px] pb-28">
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h2l2.2 10.4a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L21 9H7" />
              <circle cx="10.5" cy="20" r="1.3" />
              <circle cx="18" cy="20" r="1.3" />
            </svg>
          }
          title="Your basket is empty"
          body="Fresh seafood is waiting."
          actionLabel="Browse Seafood"
          actionHref="/shop"
        />
      </div>
    </main>
  );
}
