"use client";

import { useState } from "react";
import { SiteHeader, SiteFooter } from "../chrome";
import { signIn, useSession, isStaff, SHOP_CODE } from "../session";

// Sign in, asked in two steps.
//
// The first is which side of the counter somebody is on, and it is worth its own
// screen: a florist and the owner want completely different things once they are
// through, and the alternative — one form with a shop-code field on it — makes
// every buyer read a question that is not for them and wonder whether they were
// supposed to have a code.
//   Asked as two buttons rather than a dropdown or a pair of radios because
// there are exactly two answers and neither is a default.
type Who = "staff" | "buyer";

export default function SignIn() {
  const session = useSession();
  const [who, setWho] = useState<Who | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);

  const submit = () => {
    if (!name.trim()) return;
    if (who === "buyer") return signIn(name, "buyer");
    if (code.trim() !== SHOP_CODE) return setWrong(true);
    signIn(name, "staff");
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="gate">
          <div className="gate-inner">
            {session ? (
              <>
                <h1>Signed In</h1>
                <p>
                  As {session.name}{isStaff(session) ? ", staff" : ""}.
                </p>
                <p className="gate-back">
                  <a className="solid-button" href={isStaff(session) ? "/admin" : "/account"}>
                    {isStaff(session) ? "Go To The Cooler" : "See My Orders"}
                  </a>
                </p>
              </>
            ) : who === null ? (
              <>
                <h1>Sign In</h1>
                <p>Which are you?</p>
                <div className="gate-choices">
                  <button className="gate-choice" type="button" onClick={() => setWho("staff")}>
                    I Work Here
                  </button>
                  <button className="gate-choice" type="button" onClick={() => setWho("buyer")}>
                    I Am Buying
                  </button>
                </div>
                {/* The two buttons above are the first-time path: they ask which
                    side of the counter somebody is on. A returning buyer already
                    knows, and this takes them straight past the question. Staff
                    do not get the shortcut, because their form asks for the shop
                    code and skipping to it would be skipping the point. */}
                <p className="field-hint gate-back">
                  Already have an account?{" "}
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => setWho("buyer")}
                    style={{ border: 0, background: "none", padding: 0, cursor: "pointer", font: "inherit" }}
                  >
                    Log in here
                  </button>.
                </p>
              </>
            ) : (
              <>
                <h1>{who === "staff" ? "Staff Sign In" : "Sign In"}</h1>

                <div className="field">
                  <label htmlFor="name">Your name</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>

                {who === "staff" && (
                  <div className="field" style={{ marginTop: 26 }}>
                    <label htmlFor="code">Shop code</label>
                    <p className="field-hint">Ask whoever runs the shop if you do not have it.</p>
                    <input
                      id="code"
                      value={code}
                      autoComplete="off"
                      onChange={(e) => { setCode(e.target.value); setWrong(false); }}
                    />
                    {wrong && <p className="field-error">That code is not right.</p>}
                  </div>
                )}

                <p className="gate-back">
                  <button className="solid-button" type="button" onClick={submit} disabled={!name.trim()}>
                    Sign In
                  </button>
                </p>

                {who === "buyer" && (
                  <p className="field-hint">
                    Buying for the first time? <a className="text-link" href="/sign-up">Set up an account</a>.
                  </p>
                )}
                <p className="field-hint">
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => { setWho(null); setCode(""); setWrong(false); }}
                    style={{ border: 0, background: "none", padding: 0, cursor: "pointer", font: "inherit" }}
                  >
                    Not you? Go back
                  </button>
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
