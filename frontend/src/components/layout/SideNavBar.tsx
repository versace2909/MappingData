"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#e8eff3] flex flex-col p-4">
      {/* Workspace Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-[#dde1ff] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#3755c3]">database</span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#2a3439] font-headline">
            Project Workspace
          </h2>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#566166]">
            Enterprise Data
          </p>
        </div>
      </div>

      {/* New Mapping CTA */}
      <Link
        href="/mappings"
        className="mb-8 w-full primary-gradient text-[#f8f7ff] py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        New Mapping
      </Link>

      {/* Primary Nav */}
      <nav className="flex-1 space-y-1">
        <Link
          href="/data-sources/upload"
          className={
            isActive("/data-sources/upload")
              ? "flex items-center gap-3 px-3 py-2 text-[#3755c3] font-bold bg-[#dde1ff] rounded-xl translate-x-1 duration-200"
              : "flex items-center gap-3 px-3 py-2 text-[#566166] hover:bg-white/50 rounded-xl transition-all"
          }
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span className="text-sm">Recent Uploads</span>
        </Link>

        <Link
          href="/data-sources"
          className={
            pathname.startsWith("/data-sources") && pathname !== "/data-sources/upload"
              ? "flex items-center gap-3 px-3 py-2 text-[#3755c3] font-bold bg-[#dde1ff] rounded-xl translate-x-1 duration-200"
              : "flex items-center gap-3 px-3 py-2 text-[#566166] hover:bg-white/50 rounded-xl transition-all"
          }
        >
          <span className="material-symbols-outlined text-[20px]">folder_open</span>
          <span className="text-sm">Active Projects</span>
        </Link>

        <Link
          href="/archived"
          className="flex items-center gap-3 px-3 py-2 text-[#566166] hover:bg-white/50 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">archive</span>
          <span className="text-sm">Archived</span>
        </Link>
      </nav>

      {/* Bottom Nav */}
      <div className="pt-4 space-y-1" style={{ borderTop: "1px solid rgba(169,180,185,0.15)" }}>
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 text-[#566166] hover:bg-white/50 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="text-sm">Help</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-[#566166] hover:bg-white/50 rounded-xl transition-all">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
