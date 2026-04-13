export type PublicTable = {
  id: number;
  number: number;
  capacity: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Listado de mesas: mozo de la sesión abierta cuando la mesa está ocupada. */
  activeWaiterName?: string | null;
  /** Listado de mesas: comensales de la sesión abierta (para validar capacidad al editar). */
  openSessionGuestCount?: number | null;
};
