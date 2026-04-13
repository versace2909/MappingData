"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getDataSourceDropdown, searchDataSourceDetails } from "@/lib/api";
import type { DataSourceDropdownItem, SearchDataSourceDetailsPagedResult } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

const PAGE_SIZE = 20;

function ScoreBadge({ score, hasQuery }: { score: number; hasQuery: boolean }) {
  if (!hasQuery) return <span className="text-xs text-[#566166]">—</span>;

  // Colour ramp: green ≥ 1.5, amber 0.8–1.5, grey < 0.8
  const colour =
    score >= 1.5
      ? "bg-[#d1fae5] text-[#065f46]"
      : score >= 0.8
        ? "bg-[#fef3c7] text-[#92400e]"
        : "bg-[#f0f4f7] text-[#566166]";

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${colour}`}>
      {score.toFixed(4)}
    </span>
  );
}

export default function DataSourceSearchPage() {
  const [dataSources, setDataSources] = useState<DataSourceDropdownItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SearchDataSourceDetailsPagedResult | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(searchInput, 300);
  const hasQuery = debouncedQuery.trim().length > 0;

  // Load dropdown on mount
  useEffect(() => {
    getDataSourceDropdown()
      .then(setDataSources)
      .catch(() => setDataSources([]));
  }, []);

  // Fetch results when data source, debounced query, or page changes
  useEffect(() => {
    if (selectedId === null) {
      setResult(null);
      return;
    }

    setLoading(true);
    searchDataSourceDetails(selectedId, debouncedQuery || undefined, page, PAGE_SIZE)
      .then(setResult)
      .catch(() => setResult({ items: [], totalCount: 0, page, pageSize: PAGE_SIZE }))
      .finally(() => setLoading(false));
  }, [selectedId, debouncedQuery, page]);

  // Reset to page 1 when query or data source changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedId]);

  const totalPages = result ? Math.max(1, Math.ceil(result.totalCount / PAGE_SIZE)) : 1;
  const colSpan = 5;

  return (
    <AppLayout>
      <div className="p-8 bg-[#f7f9fb] min-h-full">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-[#2a3439] tracking-tight mb-1 font-headline">
              Data Source Search
            </h1>
            <p className="text-sm text-[#566166]">
              Select a data source and search its records using full-text BM25 ranking.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Dropdown */}
            <div className="relative flex-shrink-0 sm:w-72">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#566166] pointer-events-none"
                style={{ fontSize: "18px" }}
              >
                folder_open
              </span>
              <select
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e1e9ee] rounded-xl text-sm text-[#2a3439] appearance-none focus:outline-none focus:ring-2 focus:ring-[#3755c3]/30 focus:border-[#3755c3] transition-all"
                value={selectedId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedId(val === "" ? null : Number(val));
                  setSearchInput("");
                }}
              >
                <option value="">Select a data source…</option>
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#566166] pointer-events-none"
                style={{ fontSize: "18px" }}
              >
                expand_more
              </span>
            </div>

            {/* Search input */}
            <div className="relative flex-1">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#566166] pointer-events-none"
                style={{ fontSize: "18px" }}
              >
                search
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e1e9ee] rounded-xl text-sm text-[#2a3439] focus:outline-none focus:ring-2 focus:ring-[#3755c3]/30 focus:border-[#3755c3] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f7f9fb]"
                placeholder={
                  selectedId === null
                    ? "Select a data source first…"
                    : "Search by normalized text…"
                }
                disabled={selectedId === null}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#566166] hover:text-[#2a3439] transition-colors"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    close
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #e1e9ee" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f7]/50" style={{ borderBottom: "1px solid #e1e9ee" }}>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline w-12 text-center">
                      #
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                      Primary Field
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                      Description
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                      Normalized
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline text-center w-28">
                      BM25 Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={colSpan} className="px-6 py-10 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-[#566166]">
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>
                            progress_activity
                          </span>
                          Loading…
                        </div>
                      </td>
                    </tr>
                  ) : selectedId === null ? (
                    <tr>
                      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm text-[#566166]">
                        Select a data source to view its records.
                      </td>
                    </tr>
                  ) : result && result.items.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#566166]">
                          <span className="material-symbols-outlined text-4xl opacity-30">
                            search_off
                          </span>
                          <span className="text-sm">No results found</span>
                        </div>
                      </td>
                    </tr>
                  ) : result ? (
                    result.items.map((item, idx) => {
                      const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-[#f0f4f7]/30 transition-colors"
                          style={{ borderBottom: "1px solid #f0f4f7" }}
                        >
                          <td className="px-4 py-2.5 text-xs text-[#566166] text-center font-medium">
                            {rowIndex}
                          </td>
                          <td className="px-6 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#3755c3]" />
                              <span className="font-semibold text-[#2a3439] text-sm">
                                {item.primary}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-2.5 text-xs text-[#566166]">
                            {item.description}
                          </td>
                          <td className="px-6 py-2.5 text-xs text-[#566166] italic">
                            {item.normalized}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <ScoreBadge score={item.score} hasQuery={hasQuery} />
                          </td>
                        </tr>
                      );
                    })
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {result && selectedId !== null && (
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ backgroundColor: "rgba(240,244,247,0.3)", borderTop: "1px solid #e1e9ee" }}
              >
                <span className="text-xs text-[#566166]">
                  {result.totalCount === 0 ? (
                    "0 results"
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-bold text-[#2a3439]">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, result.totalCount)}
                      </span>{" "}
                      of {result.totalCount}
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                    className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>first_page</span>
                  </button>
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_left</span>
                  </button>
                  <div className="flex items-center px-2">
                    <span className="text-xs font-bold text-[#3755c3]">{page}</span>
                    <span className="text-xs text-[#566166] mx-2">of</span>
                    <span className="text-xs font-bold text-[#2a3439]">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_right</span>
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                    className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>last_page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
