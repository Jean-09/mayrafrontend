export interface ItemInventario {
  id: number;
  sucursal: any;
  producto: string;
  cantidad: number;
  tipo_movimiento: 'entrada' | 'salida';
  fecha: Date;
  observaciones?: string;
}

export interface ResumenInventario {
  producto: string;
  cantidad_total: number;
  ultimo_movimiento: Date;
}