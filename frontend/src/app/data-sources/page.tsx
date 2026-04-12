"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface DataSourceListItem {
  id: string;
  dataSourceName: string;
  createdDate: string;
  createdBy: string;
}

interface DataSourcesPagedResult {
  items: DataSourceListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function DataSourcesPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DataSourcesPagedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<DataSourcesPagedResult>(
      `/api/data-sources?page=${page}&pageSize=${PAGE_SIZE}`
    )
      .then((result) => {
        setData(result);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load data sources");
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <AppLayout>
      <div className="p-8 bg-[#f7f9fb] min-h-full">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-[1.75rem] font-semibold text-[#2a3439] mb-2 font-headline">
              Data Sources
            </h1>
            <p className="text-[#566166] text-sm max-w-2xl">
              Manage and connect your enterprise data streams. Ensure index integrity and monitor
              update synchronization across all active project pipelines.
            </p>
          </div>
          <button className="px-4 py-2 bg-[#e1e9ee] text-[#566166] rounded-xl text-sm font-medium hover:bg-[#d9e4ea] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
        </div>

        {/* Create Mapping CTA */}
        <div
          className="mb-8 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: "rgba(221,225,255,0.2)", border: "1px solid rgba(55,85,195,0.1)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(55,85,195,0.1)" }}>
              <span className="material-symbols-outlined text-[#3755c3]">alt_route</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2a3439] font-headline">
                Ready to integrate?
              </h3>
              <p className="text-[#566166] text-sm">
                Start a new mapping flow between your active data sources to synchronize workflows.
              </p>
            </div>
          </div>
          <Link
            href="/mappings"
            className="px-6 py-2.5 primary-gradient text-[#f8f7ff] rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <span className="material-symbols-outlined text-lg">add_link</span>
            Create New Mapping
          </Link>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 32px 64px -15px rgba(42,52,57,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f4f7]">
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider w-16">
                    #
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                    Data Source Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#566166]">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Loading…
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#9f403d] text-sm">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && data && data.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#566166] text-sm">
                      No data sources available.
                    </td>
                  </tr>
                )}
                {!loading && !error && data && data.items.map((ds, i) => {
                  const rowIndex = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr
                      key={ds.id}
                      className={`hover:bg-[#f0f4f7] transition-colors ${
                        i % 2 === 1 ? "bg-[#f0f4f7]/30" : ""
                      }`}
                    >
                      <td className="px-6 py-3 font-mono text-xs text-[#566166]">
                        {rowIndex}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-[#2a3439]">
                        <Link
                          href={`/data-sources/${ds.id}`}
                          className="hover:text-[#3755c3] transition-colors"
                        >
                          {ds.dataSourceName}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#566166]">
                        {formatDate(ds.createdDate)}
                      </td>
                      <td className="px-6 py-3 text-sm text-[#566166]">
                        {ds.createdBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalCount > 0 && (
            <div
              className="px-6 py-4 flex justify-between items-center"
              style={{ backgroundColor: "#f0f4f7", borderTop: "1px solid rgba(169,180,185,0.1)" }}
            >
              <p className="text-sm text-[#566166]">
                Showing{" "}
                <span className="font-bold text-[#2a3439]">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.totalCount)}
                </span>{" "}
                of {data.totalCount} sources
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-[#566166] hover:bg-white/60 rounded-xl transition-colors disabled:opacity-30"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-[#566166]">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm ${
                          item === page
                            ? "bg-[#3755c3] text-[#f8f7ff] font-bold"
                            : "text-[#566166] hover:bg-white/60"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  className="p-2 text-[#566166] hover:bg-white/60 rounded-xl transition-colors disabled:opacity-30"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
