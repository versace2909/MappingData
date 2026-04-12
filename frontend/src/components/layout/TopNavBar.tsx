"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNavBar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/data-sources", label: "Data Sources" },
    { href: "/mappings", label: "Mappings" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f0f4f7] flex justify-between items-center h-16 px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold text-[#3755c3] font-headline">
          MapFlow
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-sm font-semibold text-[#3755c3] border-b-2 border-[#3755c3] pb-1 font-headline"
                    : "text-sm font-medium text-[#566166] hover:text-[#2a3439] transition-colors font-headline"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center bg-[#d9e4ea] rounded-lg px-3 py-1.5 w-64">
          <span className="material-symbols-outlined text-[#566166] text-sm mr-2" style={{ fontSize: "18px" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search resources..."
            className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full placeholder-[#566166]"
          />
        </div>
        <button className="text-[#566166] hover:text-[#3755c3] transition-colors p-2">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-[#566166] hover:text-[#3755c3] transition-colors p-2">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#3755c3] overflow-hidden flex items-center justify-center text-white text-sm font-semibold">
          JD
        </div>
      </div>
    </header>
  );
}
