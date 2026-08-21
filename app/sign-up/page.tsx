"use client";

import { useState } from "react";
import { SiteHeader, SiteFooter } from "../chrome";
import { signIn, useSession } from "../session";

// Setting up a buying account. Self-serve and immediate, per the decision: no
// approval queue, no waiting to be let in. What it asks for is what an invoice
// and a delivery need, and nothing else — a florist filling this in at six in
// the morning is not going to answer a questionnaire.
export default function SignUp() {
  const session = useSession();
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <>
      <SiteHeader />
      <main>
        <section className="gate">
          <div className="gate-inner">
          <div className="page-head" style={{ padding: 0 }}>
            <h1>Set Up An Account</h1>
            <p>
              So you can send us an order and get a quote back. Prices move with
              the market each morning, so we confirm them when we confirm your
              flowers.
            </p>
          </div>

          <div>
            {session ? (
              <>
                <p>You are signed in as {session.name}.</p>
                <a className="solid-button" href="/account">See My Orders</a>
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="business">Business name</label>
                  <input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} autoComplete="organization" />
                </div>
                <div className="field" style={{ marginTop: 26 }}>
                  <label htmlFor="contact">Your name</label>
                  <input id="contact" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div className="field" style={{ marginTop: 26 }}>
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
                </div>

                <button
                  className="solid-button"
                  type="button"
                  style={{ marginTop: 22 }}
                  disabled={!business.trim() || !name.trim()}
                  onClick={() => signIn(name || business, "buyer")}
                >
                  Create Account
                </button>
                <p className="field-hint" style={{ marginTop: 18 }}>
                  Already have an account? <a className="text-link" href="/sign-in">Log in here</a>.
                </p>
              </>
            )}
          </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
