import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { getDataSourceDetails } from "@/lib/api";

const PAGE_SIZE = 10;

export default async function DataSourcePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  let result;
  try {
    result = await getDataSourceDetails(id, page, PAGE_SIZE);
  } catch {
    result = { items: [], totalCount: 0, page, pageSize: PAGE_SIZE };
  }

  const { items, totalCount, pageSize } = result;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const buildPageUrl = (p: number) =>
    `/data-sources/${id}?page=${p}`;

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
                  Data Source
                </h1>
                <div className="flex items-center gap-4 text-xs text-[#566166]">
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
                    <th className="px-6 py-3 text-[10px] font-bold text-[#566166] uppercase tracking-widest font-headline">
                      Normalized
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#566166]">
                        No data available.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const rowIndex = (page - 1) * pageSize + idx + 1;
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
                        </tr>
                      );
                    })
                  )}
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
                  <span className="font-bold text-[#2a3439]">
                    {totalCount === 0
                      ? "0"
                      : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)}`}
                  </span>{" "}
                  of {totalCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={buildPageUrl(1)}
                  aria-disabled={page <= 1}
                  className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page <= 1 ? "opacity-30 pointer-events-none" : ""}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    first_page
                  </span>
                </Link>
                <Link
                  href={buildPageUrl(page - 1)}
                  aria-disabled={page <= 1}
                  className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page <= 1 ? "opacity-30 pointer-events-none" : ""}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    chevron_left
                  </span>
                </Link>
                <div className="flex items-center px-2">
                  <span className="text-xs font-bold text-[#3755c3]">{page}</span>
                  <span className="text-xs text-[#566166] mx-2">of</span>
                  <span className="text-xs font-bold text-[#2a3439]">{totalPages}</span>
                </div>
                <Link
                  href={buildPageUrl(page + 1)}
                  aria-disabled={page >= totalPages}
                  className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page >= totalPages ? "opacity-30 pointer-events-none" : ""}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    chevron_right
                  </span>
                </Link>
                <Link
                  href={buildPageUrl(totalPages)}
                  aria-disabled={page >= totalPages}
                  className={`p-1 text-[#566166] hover:bg-[#e1e9ee] rounded-lg transition-colors ${page >= totalPages ? "opacity-30 pointer-events-none" : ""}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    last_page
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
