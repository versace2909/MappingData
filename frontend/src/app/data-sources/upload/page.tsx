"use client";

import { useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

const ALLOWED_EXTENSIONS = [".xlsx", ".csv"];

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

export default function UploadDashboardPage() {
  const [dataSourceName, setDataSourceName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type "${ext}" is not supported. Please upload a .xlsx or .csv file.`;
    }
    return null;
  }

  function handleFileSelect(file: File) {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setFileError(null);
      setSelectedFile(file);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setSubmitError(null);

    if (!dataSourceName.trim()) {
      setNameError("Data source name is required.");
      return;
    }
    setNameError(null);

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("dataSourceName", dataSourceName.trim());
    formData.append("file", selectedFile);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/data-sources/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(`Data source "${data.dataSourceName}" uploaded successfully.`);
        setSelectedFile(null);
        setDataSourceName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error ?? `Upload failed (${res.status}).`);
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = dataSourceName.trim().length > 0 && selectedFile !== null && !isSubmitting;

  return (
    <AppLayout>
      <div className="p-8 bg-[#f7f9fb] min-h-full">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#2a3439] mb-2 font-headline">
              Upload Data Source
            </h1>
            <p className="text-[#566166] max-w-2xl text-sm">
              Upload your datasets to begin mapping entities. We support .xlsx and .csv formats
              with the required template structure.
            </p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Data Source Name */}
              <div className="mb-4">
                <label
                  htmlFor="dataSourceName"
                  className="block text-sm font-semibold text-[#2a3439] mb-1"
                >
                  Data Source Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="dataSourceName"
                  type="text"
                  value={dataSourceName}
                  onChange={(e) => {
                    setDataSourceName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Enter a name for this data source"
                  className="w-full px-4 py-2 rounded-lg border text-sm text-[#2a3439] outline-none focus:ring-2 focus:ring-[#3755c3]"
                  style={{ borderColor: nameError ? "#ef4444" : "rgba(169,180,185,0.4)" }}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-500">{nameError}</p>
                )}
              </div>

              {/* Drag & Drop Upload Zone */}
              <div>
                <div
                  className={`bg-[#f0f4f7] rounded-xl border-2 border-dashed transition-all group cursor-pointer flex flex-col items-center justify-center ${
                    isDragOver ? "border-[#3755c3] bg-[#e8eeff]" : "border-[#a9b4b9]/40 hover:border-[#3755c3]"
                  }`}
                  style={{ minHeight: "280px" }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center p-12">
                    <div className="w-20 h-20 bg-[#dde1ff] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <span
                        className="material-symbols-outlined text-[#3755c3]"
                        style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}
                      >
                        upload_file
                      </span>
                    </div>
                    {selectedFile ? (
                      <>
                        <h3 className="text-xl font-semibold text-[#2a3439] mb-2 font-headline">
                          {selectedFile.name}
                        </h3>
                        <p className="text-[#566166] text-sm">
                          {(selectedFile.size / 1024).toFixed(1)} KB — click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-[#2a3439] mb-2 font-headline">
                          Upload Excel or CSV File
                        </h3>
                        <p className="text-[#566166] mb-8 text-sm">
                          Drag and drop your spreadsheet here, or{" "}
                          <span className="text-[#3755c3] font-semibold hover:underline">
                            browse your files
                          </span>
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-semibold text-[#566166]">
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            MAX 10MB
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-semibold text-[#566166]">
                            <span className="material-symbols-outlined text-[16px]">table_chart</span>
                            .xlsx · .csv
                          </div>
                        </div>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".xlsx,.csv"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {fileError && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {fileError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: canSubmit ? "#3755c3" : "#3755c3" }}
                >
                  {isSubmitting ? "Uploading..." : "Upload"}
                </button>

                <a
                  href="/api/data-sources/template"
                  download="data-source-template.xlsx"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-[#3755c3] border hover:bg-[#f0f4f7] transition-colors flex items-center gap-1"
                  style={{ borderColor: "rgba(55,85,195,0.3)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Template
                </a>
              </div>
            </form>

            {/* Success / Error feedback */}
            {successMessage && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {successMessage}
              </div>
            )}
            {submitError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {submitError}
              </div>
            )}

            {/* Recent Data Sources Table */}
            <div>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid rgba(169,180,185,0.1)" }}>
                {/* Table Header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f0f4f7" }}>
                  <h3 className="font-semibold text-[#2a3439] font-headline">Recent Data Sources</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <span
                        className="material-symbols-outlined absolute left-2.5 text-[#566166]"
                        style={{ fontSize: "16px" }}
                      >
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Search sources..."
                        className="pl-8 pr-4 py-1.5 bg-[#f0f4f7] rounded-lg text-sm border-none outline-none focus:ring-1 w-64"
                        style={{ outline: "none" }}
                      />
                    </div>
                    <button className="p-2 hover:bg-[#f0f4f7] rounded-lg transition-colors text-[#566166]">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        filter_list
                      </span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f0f4f7]/50">
                        <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                          Source Name
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                          Upload Date
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#566166]">
                          No data sources uploaded yet.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
