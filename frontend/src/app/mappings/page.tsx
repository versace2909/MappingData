import AppLayout from "@/components/layout/AppLayout";
import MappingConfigurationClient from "./MappingConfigurationClient";
import { mappingSources, mappingTargets } from "@/lib/mockData";

export default function MappingConfigurationPage() {
  return (
    <AppLayout>
      <MappingConfigurationClient sources={mappingSources} targets={mappingTargets} />
    </AppLayout>
  );
}
