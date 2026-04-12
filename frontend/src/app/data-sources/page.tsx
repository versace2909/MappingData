import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { dataSources, dataSourceStats } from "@/lib/mockData";

export default function DataSourcesPage() {
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#f0f4f7] p-6 rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#566166] mb-2">
              TOTAL SOURCES
            </p>
            <p className="text-3xl font-bold text-[#2a3439] font-headline">
              {dataSourceStats.totalSources}
            </p>
          </div>
          <div className="bg-[#f0f4f7] p-6 rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#566166] mb-2">
              ACTIVE UPTIME
            </p>
            <p className="text-3xl font-bold text-[#3755c3] font-headline">
              {dataSourceStats.activeUptime}
            </p>
          </div>
          <div className="bg-[#f0f4f7] p-6 rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#566166] mb-2">
              SYNC ERRORS
            </p>
            <p className="text-3xl font-bold text-[#9f403d] font-headline">
              {dataSourceStats.syncErrors}
            </p>
          </div>
          <div className="bg-[#f0f4f7] p-6 rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#566166] mb-2">
              DATA THROUGHPUT
            </p>
            <p className="text-3xl font-bold text-[#2a3439] font-headline">
              {dataSourceStats.dataThroughput}
            </p>
          </div>
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
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider w-24">
                    INDEX
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                    DATA SOURCE NAME
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider">
                    LAST UPDATED DATE
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[#566166] uppercase tracking-wider text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataSources.map((ds, i) => (
                  <tr
                    key={ds.id}
                    className={`hover:bg-[#f0f4f7] transition-colors group ${
                      i === 2 ? "bg-[#dde1ff]/20" : i % 2 === 1 ? "bg-[#f0f4f7]/30" : ""
                    }`}
                  >
                    <td
                      className={`px-6 py-3 font-mono text-xs ${
                        i === 2 ? "text-[#0732a3] font-bold" : "text-[#566166]"
                      }`}
                    >
                      #{ds.id}
                    </td>
                    <td
                      className={`px-6 py-3 text-sm ${
                        i === 2
                          ? "font-bold text-[#0732a3]"
                          : "font-medium text-[#2a3439]"
                      }`}
                    >
                      <Link
                        href={`/data-sources/${ds.id}`}
                        className="hover:text-[#3755c3] transition-colors"
                      >
                        {ds.name}
                      </Link>
                    </td>
                    <td className={`px-6 py-3 text-sm ${i === 2 ? "text-[#0732a3]" : "text-[#566166]"}`}>
                      {ds.updatedAt}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/data-sources/${ds.id}`}
                        className="text-[#a9b4b9] hover:text-[#3755c3] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          open_in_new
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="px-6 py-4 flex justify-between items-center"
            style={{ backgroundColor: "#f0f4f7", borderTop: "1px solid rgba(169,180,185,0.1)" }}
          >
            <p className="text-sm text-[#566166]">
              Showing <span className="font-bold text-[#2a3439]">1–7</span> of 124 sources
            </p>
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-[#566166] hover:bg-white/60 rounded-xl transition-colors opacity-30"
                disabled
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#3755c3] text-[#f8f7ff] rounded-xl text-sm font-bold">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-[#566166] hover:bg-white/60 rounded-xl text-sm">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-[#566166] hover:bg-white/60 rounded-xl text-sm">
                3
              </button>
              <span className="px-1 text-[#566166]">...</span>
              <button className="w-8 h-8 flex items-center justify-center text-[#566166] hover:bg-white/60 rounded-xl text-sm">
                18
              </button>
              <button className="p-2 text-[#566166] hover:bg-white/60 rounded-xl transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
