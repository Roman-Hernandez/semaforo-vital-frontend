
"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F6FA] lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">

      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-col">
        <Topbar onMenuClick={() => setMenuOpen(!menuOpen)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>

    </div>
  );
}
