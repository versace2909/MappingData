import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { dataSourcePreviewFields, dataSources } from "@/lib/mockData";

export default async function DataSourcePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const source = dataSources.find((ds) => ds.id === id);
  const sourceName = source?.name ?? `Customer_Inventory_Master_v2`;

  return (
    <AppLayout>
      <div className="p-8 bg-[#f7f9fb] min-h-full">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb + Header */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-[#566166] text-[10px] font-semibold uppercase tracking-widest mb-3">
              <Link href="/data-sources" className="hover:text-[#3755c3] transition-colors cursor-pointer">
                Data Sources
              </Link>
              <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>
                chevron_right
              </span>
              <span className="text-[#2a3439]">Preview</span>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-[#2a3439] tracking-tight mb-1 font-headline">
                  {sourceName}
                </h1>
                <div className="flex items-center gap-4 text-xs text-[#566166]">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                      calendar_today
                    </span>
                    Updated 2h ago
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                      tag
                    </span>
                    #{id}
                  </span>
                </div>
              </div>
              <Link
                href="/mappings"
                className="px-5 py-2 primary-gradient text-[#f8f7ff] rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  alt_route
                </span>
                Start Mapping
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #e1e9ee" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="bg-[#f0f4f7]/50"
                    style={{ borderBottom: "1px solid #e1e9ee" }}
                  >
                    <th className="px-4 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline w-12 text-center">
                      #
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                      Primary Field
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataSourcePreviewFields.map((field) => (
                    <tr
                      key={field.id}
                      className="hover:bg-[#f0f4f7]/30 transition-colors"
                      style={{ borderBottom: "1px solid #f0f4f7" }}
                    >
                      <td className="px-4 py-2.5 text-xs text-[#566166] text-center font-medium">
                        {field.id}
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#3755c3]" />
                          <span className="font-semibold text-[#2a3439] text-sm">
                            {field.primary}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-xs text-[#566166]">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                backgroundColor: "rgba(240,244,247,0.3)",
                borderTop: "1px solid #e1e9ee",
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#566166]">
                  Showing{" "}
                  <span className="font-bold text-[#2a3439]">1–{dataSourcePreviewFields.length}</span> of 24
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#566166]">Rows per page:</span>
                  <select className="bg-transparent border-none text-xs font-bold text-[#2a3439] focus:ring-0 cursor-pointer outline-none">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors opacity-30" disabled>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    first_page
                  </span>
                </button>
                <button className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors opacity-30" disabled>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    chevron_left
                  </span>
                </button>
                <div className="flex items-center px-2">
                  <span className="text-xs font-bold text-[#3755c3]">1</span>
                  <span className="text-xs text-[#566166] mx-2">of</span>
                  <span className="text-xs font-bold text-[#2a3439]">3</span>
                </div>
                <button className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    chevron_right
                  </span>
                </button>
                <button className="p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    last_page
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
