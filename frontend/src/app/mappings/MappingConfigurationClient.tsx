"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  sources: string[];
  targets: string[];
}

export default function MappingConfigurationClient({ sources, targets }: Props) {
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");

  const canContinue = selectedSource && selectedTarget;

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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 items-end">
            {/* Source Selection */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-bold text-[#2a3439] uppercase tracking-wide font-headline">
                  Source Data
                </span>
                <div className="mt-2 relative">
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white rounded-xl text-sm appearance-none focus:outline-none cursor-pointer text-[#2a3439]"
                    style={{ border: "1px solid rgba(169,180,185,0.3)" }}
                  >
                    <option value="">Select Source...</option>
                    {sources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#717c82] pointer-events-none"
                    style={{ fontSize: "20px" }}
                  >
                    expand_more
                  </span>
                </div>
              </label>
              {selectedSource && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-xs text-[#566166]">
                  <span className="material-symbols-outlined text-[#3755c3]" style={{ fontSize: "14px" }}>
                    check_circle
                  </span>
                  <span className="font-medium text-[#2a3439]">{selectedSource}</span>
                </div>
              )}
            </div>

            {/* Central Connector */}
            <div className="flex flex-col items-center justify-center pb-0.5">
              <div className="relative group">
                <button
                  className="primary-gradient text-[#f8f7ff] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  onClick={() => {
                    if (canContinue) router.push("/mappings/results");
                  }}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}
                  >
                    auto_awesome
                  </span>
                </button>
                <div className="absolute -bottom-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[#2a3439] text-[#f7f9fb] text-[10px] font-bold py-1 px-2 rounded left-1/2 -translate-x-1/2">
                  Run Auto-Map
                </div>
              </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-bold text-[#2a3439] uppercase tracking-wide font-headline">
                  Target Data
                </span>
                <div className="mt-2 relative">
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white rounded-xl text-sm appearance-none focus:outline-none cursor-pointer text-[#2a3439]"
                    style={{ border: "1px solid rgba(169,180,185,0.3)" }}
                  >
                    <option value="">Select Target...</option>
                    {targets.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#717c82] pointer-events-none"
                    style={{ fontSize: "20px" }}
                  >
                    expand_more
                  </span>
                </div>
              </label>
              {selectedTarget && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-xs text-[#566166]">
                  <span className="material-symbols-outlined text-[#3755c3]" style={{ fontSize: "14px" }}>
                    check_circle
                  </span>
                  <span className="font-medium text-[#2a3439]">{selectedTarget}</span>
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => { if (canContinue) router.push("/mappings/results"); }}
              disabled={!canContinue}
              className={`px-8 py-3 rounded-xl font-semibold shadow-md transition-all text-sm ${
                canContinue
                  ? "bg-[#3755c3] text-[#f8f7ff] hover:bg-[#2848b7] active:scale-95"
                  : "bg-[#d9e4ea] text-[#a9b4b9] cursor-not-allowed"
              }`}
            >
              Continue to Field Mapping
            </button>
          </div>
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
