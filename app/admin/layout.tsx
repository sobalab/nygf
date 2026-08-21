import type { Metadata } from "next";
import "../admin.css";
import { AdminGate, AdminWho } from "./gate";

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
        <AdminWho />
      </div>
      <AdminGate>{children}</AdminGate>
    </div>
  );
}
