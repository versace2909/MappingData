const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface DataSourceDetailItem {
  primary: string;
  description: string;
  normalized: string;
}

export interface DataSourceDetailsPagedResult {
  items: DataSourceDetailItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function getDataSourceDetails(
  id: string,
  page = 1,
  pageSize = 10
): Promise<DataSourceDetailsPagedResult> {
  return apiFetch<DataSourceDetailsPagedResult>(
    `/api/data-sources/${id}/details?page=${page}&pageSize=${pageSize}`
  );
}

export interface DataSourceDropdownItem {
  id: number;
  name: string;
}

export async function getDataSourceDropdown(): Promise<DataSourceDropdownItem[]> {
  return apiFetch<DataSourceDropdownItem[]>("/api/data-sources/list-dropdown");
}

export interface CreateDataMappingRequest {
  mappingName: string;
  sourceDataId: number;
  targetDataId: number;
}

export interface CreateDataMappingResult {
  id: number;
  status: string;
}

export async function createDataMapping(
  body: CreateDataMappingRequest
): Promise<CreateDataMappingResult> {
  return apiFetch<CreateDataMappingResult>("/api/data-mapping", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface DataMappingListItem {
  id: number;
  mappingName: string;
  createdDate: string;
  createdBy: string | null;
  sourceDataName: string;
  targetDataName: string;
  status: string;
}

export interface DataMappingPagedResult {
  items: DataMappingListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface DataMappingDetailItem {
  id: number;
  sourceCode: string;
  sourceDescription: string;
  targetCode: string | null;
  targetDescription: string | null;
  mappingType: string;
  isVerified: boolean;
  score: number | null;
}

export interface DataMappingDetailPagedResult {
  items: DataMappingDetailItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function getDataMappingDetails(
  id: number,
  page = 1,
  pageSize = 20
): Promise<DataMappingDetailPagedResult> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return apiFetch<DataMappingDetailPagedResult>(`/api/data-mapping/${id}/details?${params}`);
}

export async function getDataMappingList(
  page = 1,
  pageSize = 10,
  mappingName?: string
): Promise<DataMappingPagedResult> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (mappingName) params.set("mappingName", mappingName);
  return apiFetch<DataMappingPagedResult>(`/api/data-mapping?${params}`);
}
