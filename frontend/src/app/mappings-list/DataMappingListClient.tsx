"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDataMappingList, DataMappingListItem } from "@/lib/api";

const PAGE_SIZE = 10;

const NAVIGABLE_STATUSES = new Set(["Verifying", "Verified"]);

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-blue-50 text-blue-600",
    Processing: "bg-purple-50 text-purple-600",
    Mapping: "bg-yellow-50 text-yellow-600",
    Verifying: "bg-orange-50 text-orange-600",
    Verified: "bg-green-50 text-green-600",
  };
  const cls = colors[status] ?? "bg-gray-50 text-gray-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export default function DataMappingListClient() {
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DataMappingListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilter(filter);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [filter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDataMappingList(page, PAGE_SIZE, debouncedFilter || undefined);
      setItems(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="p-8 bg-[#f7f9fb] min-h-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-[#566166] text-[10px] font-semibold uppercase tracking-widest mb-3">
            <Link href="/mappings" className="hover:text-[#3755c3] transition-colors cursor-pointer">
              Mappings
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>
              chevron_right
            </span>
            <span className="text-[#2a3439]">All Mappings</span>
          </nav>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-[#2a3439] tracking-tight font-headline">
              Data Mappings
            </h1>
            <Link
              href="/mappings"
              className="px-5 py-2 primary-gradient text-[#f8f7ff] rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                add
              </span>
              New Mapping
            </Link>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a9b4b9]"
              style={{ fontSize: "18px" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Filter by mapping name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white rounded-xl text-sm focus:outline-none text-[#2a3439] w-72"
              style={{ border: "1px solid rgba(169,180,185,0.3)" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 32px 64px -15px rgba(42,52,57,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f4f7]/50" style={{ borderBottom: "1px solid #e1e9ee" }}>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                    Mapping Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                    Source Data
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                    Target Data
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#566166]">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#566166]">
                      No mappings found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f0f4f7]/30 transition-colors"
                      style={{ borderBottom: "1px solid #f0f4f7" }}
                    >
                      <td className="px-6 py-3 text-sm font-semibold text-[#2a3439]">
                        {NAVIGABLE_STATUSES.has(item.status) ? (
                          <Link
                            href={`/mappings-list/${item.id}`}
                            className="text-[#3755c3] hover:underline"
                          >
                            {item.mappingName}
                          </Link>
                        ) : (
                          <span
                            title={`Detail view is available when status is Verifying or Verified (current: ${item.status})`}
                            className="cursor-default"
                          >
                            {item.mappingName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-[#566166]">{item.sourceDataName}</td>
                      <td className="px-6 py-3 text-sm text-[#566166]">{item.targetDataName}</td>
                      <td className="px-6 py-3 text-xs text-[#566166]">
                        {new Date(item.createdDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-xs text-[#566166]">{item.createdBy ?? "—"}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ backgroundColor: "rgba(240,244,247,0.3)", borderTop: "1px solid #e1e9ee" }}
          >
            <span className="text-xs text-[#566166]">
              Showing{" "}
              <span className="font-bold text-[#2a3439]">
                {totalCount === 0
                  ? "0"
                  : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)}`}
              </span>{" "}
              of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page <= 1 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>first_page</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page <= 1 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_left</span>
              </button>
              <div className="flex items-center px-2">
                <span className="text-xs font-bold text-[#3755c3]">{page}</span>
                <span className="text-xs text-[#566166] mx-2">of</span>
                <span className="text-xs font-bold text-[#2a3439]">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page >= totalPages ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_right</span>
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page >= totalPages ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>last_page</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
