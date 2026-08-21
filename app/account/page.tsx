"use client";

import { SiteHeader, SiteFooter } from "../chrome";
import { signOut, useSession, isStaff } from "../session";

// Where a buyer lands after signing in. Empty on purpose for now: orders are
// Phase 3, and a screen that invents three fake orders to look finished would be
// harder to reason about than one that says plainly there is nothing here yet.
export default function Account() {
  const session = useSession();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="gate">
          <div className="gate-inner">
          <div className="page-head" style={{ padding: 0 }}>
            <h1>{session ? session.name : "My Orders"}</h1>
            <p>
              {session
                ? "Your order requests and quotes will show up here."
                : "Sign in to see your orders."}
            </p>
          </div>
          <div>
            {session ? (
              <>
                {isStaff(session) && <a className="solid-button" href="/admin">Go To The Cooler</a>}
                <p className="field-hint">You have not sent an order yet.</p>
                <a className="text-link" href="/catalogue">Browse the catalogue</a>
                <p style={{ marginTop: 24 }}>
                  <button className="text-link" type="button" onClick={signOut} style={{ border: 0, background: "none", padding: 0, cursor: "pointer" }}>
                    Sign out
                  </button>
                </p>
              </>
            ) : (
              <a className="solid-button" href="/sign-in">Sign In</a>
            )}
          </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
