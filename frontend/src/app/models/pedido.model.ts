export interface Pedido {
  id: number;
  sucursal: any;
  fecha: Date;
  estado: 'En proceso' | 'En camino' | 'Entregado';
  prendas: PrendaPedido[];
  total: number;
  observaciones?: string;
}

export interface PrendaPedido {
  id?: number;
  categoria: CategoriaPrenda;
  servicios: Servicio[];
  observaciones?: string;
  subtotal: number;
}

export interface CategoriaPrenda {
  id: number;
  nombre: string;
  precio_base: number;
}

export interface Servicio {
  id: number;
  nombre: string;
  precio_adicional: number;
}

export interface FiltrosPedidos {
  fecha_inicio?: Date;
  fecha_fin?: Date;
  estado?: string;
  sucursal?: number;
}