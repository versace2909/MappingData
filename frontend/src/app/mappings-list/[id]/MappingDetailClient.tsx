"use client";

import { useState, useEffect, useCallback } from "react";
import { getDataMappingDetails, DataMappingDetailItem } from "@/lib/api";

const PAGE_SIZE = 20;

function MappingTypeBadge({ type }: { type: string }) {
  if (type === "Manual") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
        Manual
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
      Auto
    </span>
  );
}

function VerifiedStatus({ isVerified }: { isVerified: boolean }) {
  if (isVerified) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
        <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
          check
        </span>
        Verified
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[#566166] font-medium text-sm">
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        radio_button_unchecked
      </span>
      Unverified
    </span>
  );
}

export default function MappingDetailClient({ mappingId }: { mappingId: number }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DataMappingDetailItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDataMappingDetails(mappingId, page, PAGE_SIZE);
      setItems(result.items);
      setTotalCount(result.totalCount);
      setNotFound(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("404")) {
        setNotFound(true);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [mappingId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (notFound) {
    return (
      <div className="flex items-center justify-center py-24 text-[#566166] text-sm">
        Mapping not found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 32px 64px -15px rgba(42,52,57,0.06)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f4f7]/50" style={{ borderBottom: "1px solid #e1e9ee" }}>
              <th className="px-4 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline w-12 text-center">
                #
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                Source Field
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                Mapped Target Field
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                Mapping Type
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                Verified Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#566166]">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#566166]">
                  No detail records found.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#f0f4f7]/30 transition-colors"
                  style={{ borderBottom: "1px solid #f0f4f7" }}
                >
                  <td className="px-4 py-4 text-center font-medium text-[#566166] text-sm">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-[#2848b7] text-sm">{item.sourceCode}</div>
                    {item.sourceDescription && (
                      <div className="text-xs text-[#566166] mt-0.5">{item.sourceDescription}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.targetCode ? (
                      <>
                        <div className="font-mono font-bold text-[#526074] text-sm">{item.targetCode}</div>
                        {item.targetDescription && (
                          <div className="text-xs text-[#566166] italic mt-0.5">{item.targetDescription}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-mono font-bold text-[#9f403d] text-sm">UNRESOLVED</div>
                        <div className="text-xs text-[#9f403d] italic mt-0.5">No matching schema node found.</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <MappingTypeBadge type={item.mappingType} />
                  </td>
                  <td className="px-6 py-4">
                    <VerifiedStatus isVerified={item.isVerified} />
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
  );
}
