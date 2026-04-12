"use client";

import { useState } from "react";
import type { MappingResult } from "@/lib/mockData";

interface TargetField {
  id: string;
  fieldName: string;
  description: string;
}

interface Props {
  results: MappingResult[];
  targetFields: TargetField[];
}

export default function MappingResultsClient({ results, targetFields }: Props) {
  const [activeMapping, setActiveMapping] = useState<MappingResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "review">("all");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedTargetField, setSelectedTargetField] = useState<string | null>(null);

  const filteredResults =
    filter === "review"
      ? results.filter((r) => r.status !== "verified")
      : results;

  const filteredTargetFields = targetFields.filter(
    (f) =>
      f.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openEditModal = (mapping: MappingResult) => {
    setActiveMapping(mapping);
    setSelectedTargetField(mapping.status !== "unresolved" ? mapping.targetField : null);
    setSearchQuery("");
  };

  const closeModal = () => {
    setActiveMapping(null);
    setSearchQuery("");
    setSelectedTargetField(null);
  };

  return (
    <div className="p-8 bg-[#f7f9fb] min-h-full relative">
      {/* Header */}
      <div className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#2a3439] mb-1 font-headline">Mapping Results</h1>
        <p className="text-sm text-[#566166]">
          Review the automated connections between ERP_Source_v2 and Master_Schema_Global.
        </p>
      </div>

      {/* Data Grid */}
      <div className="max-w-7xl mx-auto">
        <div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #d9e4ea" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className="bg-[#e8eff3] text-[#566166] text-xs uppercase tracking-wider font-semibold"
                  style={{ borderBottom: "1px solid #d9e4ea" }}
                >
                  <th className="px-4 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Source Field</th>
                  <th className="px-6 py-4">Mapped Target Field</th>
                  <th className="px-6 py-4">Mapping Type</th>
                  <th className="px-6 py-4">Verified Status</th>
                  <th className="px-4 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      className="rounded w-4 h-4 accent-[#3755c3]"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(results.map((r) => r.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredResults.map((mapping) => (
                  <tr
                    key={mapping.id}
                    className="hover:bg-[#f0f4f7] transition-colors"
                    style={{ borderBottom: "1px solid #f0f4f7" }}
                  >
                    <td className="px-4 py-4 text-center font-medium text-[#566166]">
                      {mapping.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-[#2848b7]">
                        {mapping.sourceField}
                      </div>
                      <div className="text-xs text-[#566166] mt-0.5">
                        {mapping.sourceDescription}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 cursor-pointer hover:bg-[#3755c3]/5 transition-colors group"
                      onClick={() => openEditModal(mapping)}
                    >
                      <div
                        className={`font-mono font-bold group-hover:text-[#3755c3] transition-colors ${
                          mapping.status === "unresolved"
                            ? "text-[#9f403d]"
                            : "text-[#526074]"
                        }`}
                      >
                        {mapping.targetField}
                      </div>
                      <div
                        className={`text-xs mt-0.5 italic ${
                          mapping.status === "unresolved"
                            ? "text-[#9f403d]"
                            : "text-[#566166]"
                        }`}
                      >
                        {mapping.targetDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          mapping.mappingType === "Manual"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-[#f0f4f7] text-[#566166]"
                        }`}
                      >
                        {mapping.mappingType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {mapping.status === "verified" ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <span
                            className="material-symbols-outlined font-bold"
                            style={{ fontSize: "18px" }}
                          >
                            check
                          </span>
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#566166] font-medium">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
                            radio_button_unchecked
                          </span>
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded w-4 h-4 accent-[#3755c3]"
                        checked={selectedRows.has(mapping.id)}
                        onChange={() => toggleRow(mapping.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 ${
                filter === "all"
                  ? "bg-[#e1e9ee] text-[#2a3439]"
                  : "bg-white text-[#566166] hover:bg-[#e1e9ee] transition-all"
              }`}
              style={{ border: filter === "all" ? "none" : "1px solid #d9e4ea" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                filter_list
              </span>
              All Records
            </button>
            <button
              onClick={() => setFilter("review")}
              className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 ${
                filter === "review"
                  ? "bg-[#e1e9ee] text-[#2a3439]"
                  : "bg-white text-[#566166] hover:bg-[#e1e9ee] transition-all"
              }`}
              style={{ border: filter === "review" ? "none" : "1px solid #d9e4ea" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                warning
              </span>
              Review Only
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#566166]">
            <span>Page 1 of 250</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#e1e9ee] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  chevron_left
                </span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#e1e9ee] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 primary-gradient text-[#f8f7ff] rounded-xl shadow-2xl flex items-center justify-center group hover:scale-105 transition-transform z-50">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}
        >
          add
        </span>
        <span className="absolute right-16 bg-[#2a3439] text-[#f7f9fb] text-xs py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Manual Link
        </span>
      </button>

      {/* Edit Mapping Modal */}
      {activeMapping && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-center justify-between bg-white"
              style={{ borderBottom: "1px solid #f0f4f7" }}
            >
              <h3 className="text-lg font-bold text-[#2a3439] font-headline">Edit Mapping</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-[#f0f4f7] rounded-full transition-colors text-[#717c82]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Source Info */}
              <div>
                <label className="block text-xs font-semibold text-[#566166] uppercase tracking-widest mb-2">
                  Source Field
                </label>
                <div className="flex gap-3 items-center">
                  <span className="font-mono font-bold text-[#2848b7] text-base">
                    {activeMapping.sourceField}
                  </span>
                  <span className="text-[#566166] text-sm">—</span>
                  <span className="text-sm text-[#566166] italic">
                    {activeMapping.sourceDescription}
                  </span>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-[#566166] uppercase tracking-widest mb-2">
                  Search Target Field
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717c82]"
                      style={{ fontSize: "18px" }}
                    >
                      search
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search fields or descriptions..."
                      className="w-full bg-[#d9e4ea] rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none placeholder-[#717c82] text-[#2a3439]"
                    />
                  </div>
                  <button className="primary-gradient text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg">
                    Search
                  </button>
                </div>
              </div>

              {/* Target Fields Table */}
              <div>
                <h3 className="text-sm font-bold text-[#2a3439] mb-4 font-headline">
                  Target Data Preview
                </h3>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e8eff3" }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className="bg-[#f0f4f7] text-[#566166] text-[10px] uppercase tracking-widest"
                        style={{ borderBottom: "1px solid #e8eff3" }}
                      >
                        <th className="px-4 py-3 font-bold">ID</th>
                        <th className="px-4 py-3 font-bold">Target Field Name</th>
                        <th className="px-4 py-3 font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredTargetFields.map((field, i) => (
                        <tr
                          key={field.id}
                          onClick={() => setSelectedTargetField(field.fieldName)}
                          className="cursor-pointer hover:bg-[#f0f4f7] transition-colors"
                          style={{
                            backgroundColor:
                              selectedTargetField === field.fieldName
                                ? "rgba(221,225,255,0.2)"
                                : i % 2 === 1
                                ? "white"
                                : undefined,
                            borderTop: i > 0 ? "1px solid #f0f4f7" : undefined,
                          }}
                        >
                          <td className="px-4 py-4 font-mono text-xs text-[#3755c3]">
                            {field.id}
                          </td>
                          <td className="px-4 py-4 font-semibold text-[#2a3439]">
                            {field.fieldName}
                            {selectedTargetField === field.fieldName && (
                              <span
                                className="ml-2 material-symbols-outlined text-[#3755c3]"
                                style={{ fontSize: "14px", verticalAlign: "middle" }}
                              >
                                check_circle
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-[#566166]">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="p-6 flex justify-end items-center gap-3 bg-[#f0f4f7]"
              style={{ borderTop: "1px solid #d9e4ea" }}
            >
              <button
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-bold text-[#566166] hover:text-[#2a3439] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className="primary-gradient text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg"
              >
                Apply Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
