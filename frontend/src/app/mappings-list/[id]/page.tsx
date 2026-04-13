import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import MappingDetailClient from "./MappingDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MappingDetailPage({ params }: Props) {
  const { id } = await params;
  const mappingId = Number(id);

  return (
    <AppLayout>
      <div className="p-8 bg-[#f7f9fb] min-h-full">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-[#566166] text-[10px] font-semibold uppercase tracking-widest mb-3">
              <Link href="/mappings" className="hover:text-[#3755c3] transition-colors cursor-pointer">
                Mappings
              </Link>
              <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>
                chevron_right
              </span>
              <Link href="/mappings-list" className="hover:text-[#3755c3] transition-colors cursor-pointer">
                All Mappings
              </Link>
              <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>
                chevron_right
              </span>
              <span className="text-[#2a3439]">Mapping Results</span>
            </nav>

            <h1 className="text-2xl font-extrabold text-[#2a3439] tracking-tight font-headline">
              Mapping Results
            </h1>
          </div>

          <MappingDetailClient mappingId={mappingId} />
        </div>
      </div>
    </AppLayout>
  );
}
