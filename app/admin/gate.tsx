"use client";

import { isStaff, signOut, useSession } from "../session";

// The door on the admin side.
//
// **This is a prototype affordance, not a security boundary.** It runs in the
// browser, over a session that is a name in localStorage, and anybody who opens
// the console is through it. It is here so the flow can be walked end to end —
// arrive signed out, get sent to sign in, come back — while Clerk is still
// waiting on provisioning.
//   The real one is two layers and neither is this: proxy.ts redirects at the
// edge, and every admin page and every admin Server Action re-checks in its own
// body, because Server Actions are POSTs to the page they live on and a proxy
// matcher does not cover them. Until that exists, do not put this on a public
// URL and do not treat the redirect below as protection.
export function AdminGate({ children }: { children: React.ReactNode }) {
  const session = useSession();

  if (!isStaff(session)) {
    return (
      <>
        <h1>Staff Only</h1>
        <p className="admin-lede">
          {session
            ? `You are signed in as ${session.name}, which is a buying account.`
            : "Sign in with the shop code to open the cooler."}
        </p>
        <a className="admin-button" style={{ textAlign: "center" }} href="/sign-in">Sign In</a>
        {session && (
          <button className="admin-button admin-button-quiet" type="button" onClick={signOut}>
            Sign Out
          </button>
        )}
        <a className="admin-button admin-button-quiet" style={{ textAlign: "center" }} href="/">Back To The Site</a>
      </>
    );
  }

  return <>{children}</>;
}

// Who is holding the phone, shown on every admin screen. A thirty-day session on
// a counter phone is exactly how a call gets logged under the wrong person's
// name, so this does not live behind a menu.
export function AdminWho() {
  const session = useSession();
  if (!session) return null;
  return (
    <span className="admin-who">
      {session.name}
      <button type="button" onClick={signOut} className="admin-signout">Sign out</button>
    </span>
  );
}
