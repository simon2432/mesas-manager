import { api } from "@/src/api/client";

import type { TableCurrentResponse } from "@/src/types/tableDetail.types";
import type { PublicTable } from "@/src/types/tables.types";

export type TablesListResponse = { tables: PublicTable[] };

export type CreateTableBody = { number: number; capacity: number };

export type UpdateTableBody = { number?: number; capacity?: number };

export async function fetchTables(): Promise<TablesListResponse> {
  const { data } = await api.get<TablesListResponse>("/tables");
  return data;
}

export async function fetchTableCurrent(
  tableId: number,
): Promise<TableCurrentResponse> {
  const { data } = await api.get<TableCurrentResponse>(
    `/tables/${tableId}/current`,
  );
  return data;
}

export async function createTable(body: CreateTableBody): Promise<PublicTable> {
  const { data } = await api.post<{ table: PublicTable }>("/tables", body);
  return data.table;
}

export async function updateTable(
  tableId: number,
  body: UpdateTableBody,
): Promise<PublicTable> {
  const { data } = await api.patch<{ table: PublicTable }>(
    `/tables/${tableId}`,
    body,
  );
  return data.table;
}

export async function toggleTableActive(
  tableId: number,
): Promise<PublicTable> {
  const { data } = await api.patch<{ table: PublicTable }>(
    `/tables/${tableId}/toggle-active`,
  );
  return data.table;
}
