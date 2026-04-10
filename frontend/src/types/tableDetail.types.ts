import type { PublicTable } from "@/src/types/tables.types";

export type OpenSessionDetail = {
  id: number;
  tableId: number;
  waiterId: number;
  guestCount: number;
  openedAt: string;
  status: string;
  total: number;
  waiter: { id: number; name: string; isActive: boolean };
  items: {
    id: number;
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    productName: string;
    note: string | null;
    lineTotal: number;
  }[];
};

export type TableCurrentResponse = {
  table: PublicTable;
  openSession: OpenSessionDetail | null;
  totalAccumulated: number;
};
