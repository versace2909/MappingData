import AppLayout from "@/components/layout/AppLayout";
import MappingResultsClient from "./MappingResultsClient";
import { mappingResults, targetFields } from "@/lib/mockData";

export default function MappingResultsPage() {
  return (
    <AppLayout>
      <MappingResultsClient results={mappingResults} targetFields={targetFields} />
    </AppLayout>
  );
}
