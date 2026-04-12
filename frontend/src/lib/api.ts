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
