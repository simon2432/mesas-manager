import { api } from "@/src/api/client";

import type { PublicTable } from "@/src/types/tables.types";

export type TablesListResponse = { tables: PublicTable[] };

export async function fetchTables(): Promise<TablesListResponse> {
  const { data } = await api.get<TablesListResponse>("/tables");
  return data;
}
