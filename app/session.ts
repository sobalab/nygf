"use client";

import { useSyncExternalStore } from "react";

// Who is signed in, for the prototype.
//
// **This is not authentication.** It is a name in localStorage, and anybody who
// opens the console can make themselves the owner. It exists so the shape of the
// thing — where sign-in lives in the header, what the shop side looks like once
// you are in, how /admin behaves when you are not — can be built and argued
// about before Clerk is provisioned. Every function here has a real counterpart
// waiting on that, and the components calling them will not have to change.
//
// Read the way client-env.ts reads the browser: a server snapshot, a client
// snapshot, and a subscription. Signed out on the server, always — which is what
// keeps every page in the site prerendered. The header ships "Sign in" in its
// HTML and swaps after hydration; the moment it awaited a session instead, every
// page on the site would turn dynamic, because the header renders on all of them.

export type Role = "buyer" | "staff" | "owner";
export type Session = { name: string; role: Role } | null;

const STORAGE_KEY = "nygf-session-prototype";

// The shop code staff sign up with. In the real thing this is a bcrypt hash in
// shop_settings that any owner can rotate from /admin/staff, and it is never
// rendered back. Here it is a constant, which is one more reason none of this is
// security.
export const SHOP_CODE = "171-10";

let session: Session = null;

if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) session = JSON.parse(saved) as Session;
  } catch {
    // A corrupt store signs you out rather than breaking the page.
  }
}

const listeners = new Set<() => void>();

function commit(next: Session) {
  session = next;
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing. The session still holds for this tab.
  }
  listeners.forEach((notify) => notify());
}

export const signIn = (name: string, role: Role) => commit({ name: name.trim(), role });
export const signOut = () => commit(null);

export function useSession() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => session,
    () => null,
  );
}

export const isStaff = (s: Session) => s?.role === "staff" || s?.role === "owner";
