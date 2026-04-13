"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getDataSourceDropdown,
  createDataMapping,
  DataSourceDropdownItem,
} from "@/lib/api";

function DataSourceCombobox({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: DataSourceDropdownItem[];
  value: DataSourceDropdownItem | null;
  onChange: (item: DataSourceDropdownItem | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(item: DataSourceDropdownItem) {
    onChange(item);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-bold text-[#2a3439] uppercase tracking-wide font-headline">
          {label}
        </span>
        <div ref={containerRef} className="mt-2 relative">
          <input
            type="text"
            placeholder={value ? value.name : `Search ${label}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full pl-4 pr-10 py-3 bg-white rounded-xl text-sm focus:outline-none text-[#2a3439]"
            style={{ border: "1px solid rgba(169,180,185,0.3)" }}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#717c82] pointer-events-none"
            style={{ fontSize: "20px" }}
          >
            expand_more
          </span>
          {open && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg max-h-52 overflow-y-auto"
              style={{ border: "1px solid rgba(169,180,185,0.3)" }}>
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-[#a9b4b9]">No results</li>
              ) : (
                filtered.map((item) => (
                  <li
                    key={item.id}
                    onMouseDown={() => select(item)}
                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f0f4f7] text-[#2a3439] ${
                      value?.id === item.id ? "font-semibold" : ""
                    }`}
                  >
                    {item.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </label>
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-xs text-[#566166]">
          <span className="material-symbols-outlined text-[#3755c3]" style={{ fontSize: "14px" }}>
            check_circle
          </span>
          <span className="font-medium text-[#2a3439]">{value.name}</span>
        </div>
      )}
    </div>
  );
}

export default function MappingConfigurationClient() {
  const router = useRouter();
  const [options, setOptions] = useState<DataSourceDropdownItem[]>([]);
  const [mappingName, setMappingName] = useState("");
  const [source, setSource] = useState<DataSourceDropdownItem | null>(null);
  const [target, setTarget] = useState<DataSourceDropdownItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDataSourceDropdown().then(setOptions).catch(() => {});
  }, []);

  const sameError = source && target && source.id === target.id
    ? "Source and Target cannot be the same"
    : null;

  const canSubmit =
    mappingName.trim() !== "" &&
    source !== null &&
    target !== null &&
    !sameError &&
    !submitting;

  async function handleRunAutoMap() {
    if (!canSubmit || !source || !target) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createDataMapping({
        mappingName: mappingName.trim(),
        sourceDataId: source.id,
        targetDataId: target.id,
      });
      router.push(`/mappings/${result.id}`);
    } catch {
      setError("Failed to create mapping. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 p-8 bg-[#f7f9fb] flex flex-col items-center min-h-full">
      <div className="w-full max-w-4xl">
        {/* Page Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#2a3439] tracking-tight mb-2 font-headline">
            Configure Mapping
          </h1>
          <p className="text-[#566166] mx-auto max-w-2xl text-sm">
            Define the relationship between your datasets. Select a source and target to begin the
            automated schema alignment process.
          </p>
        </header>

        {/* Mapping Config Card */}
        <div className="bg-[#f0f4f7] rounded-2xl p-8 shadow-sm">
          {/* Mapping Name */}
          <div className="mb-8">
            <label className="block">
              <span className="text-sm font-bold text-[#2a3439] uppercase tracking-wide font-headline">
                Mapping Name
              </span>
              <input
                type="text"
                placeholder="Enter mapping name..."
                value={mappingName}
                onChange={(e) => setMappingName(e.target.value)}
                className="mt-2 w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none text-[#2a3439]"
                style={{ border: "1px solid rgba(169,180,185,0.3)" }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 items-end">
            <DataSourceCombobox
              label="Source Data"
              options={options}
              value={source}
              onChange={setSource}
            />

            {/* Central Connector */}
            <div className="flex flex-col items-center justify-center pb-0.5">
              <div className="relative group">
                <button
                  disabled={!canSubmit}
                  onClick={handleRunAutoMap}
                  className={`primary-gradient text-[#f8f7ff] w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    canSubmit
                      ? "hover:scale-105 active:scale-95"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}
                  >
                    {submitting ? "hourglass_empty" : "auto_awesome"}
                  </span>
                </button>
                <div className="absolute -bottom-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[#2a3439] text-[#f7f9fb] text-[10px] font-bold py-1 px-2 rounded left-1/2 -translate-x-1/2">
                  Run Auto-Map
                </div>
              </div>
            </div>

            <DataSourceCombobox
              label="Target Data"
              options={options}
              value={target}
              onChange={setTarget}
            />
          </div>

          {/* Validation errors */}
          {(sameError || error) && (
            <div className="mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {sameError ?? error}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div
          className="mt-10 p-6 rounded-xl bg-white flex gap-4 items-start"
          style={{ border: "1px solid rgba(169,180,185,0.2)" }}
        >
          <span className="material-symbols-outlined text-[#3755c3]" style={{ fontSize: "22px" }}>
            lightbulb
          </span>
          <div className="text-sm text-[#566166] leading-relaxed">
            <p className="font-semibold text-[#2a3439] mb-1">How it works</p>
            Select the source dataset you want to import and the target schema you wish to map it
            to. MapFlow will automatically suggest field correlations based on semantic analysis.
            You can review and edit each mapping in the next step.
          </div>
        </div>
      </div>
    </div>
  );
}
