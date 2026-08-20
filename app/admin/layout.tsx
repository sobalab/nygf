import type { Metadata } from "next";
import "../admin.css";

// The back office is nobody's search result. It also must not be indexed if it
// is ever reachable, which it will be once auth lands and the route stops being
// a prototype.
export const metadata: Metadata = {
  title: "Cooler",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <div className="admin-bar">
        <a href="/admin">New York Garden</a>
        {/* Hard-coded in the prototype. Real once Clerk lands — and it stays on
            screen rather than living behind a menu, because a thirty-day session
            on a counter phone is exactly how a call gets logged under the wrong
            person's name. */}
        <span className="admin-who">Signed in, Sophia</span>
      </div>
      {children}
    </div>
  );
}
