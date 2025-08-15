import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Pedido, FiltrosPedidos } from '../../models/pedido.model';
import { Sucursal } from '../../models/user.model';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false
})
export class PedidosPage implements OnInit {
  currentUser: User | null = null;
  pedidos: Pedido[] = [];
  sucursales: Sucursal[] = [];
  showFilterModal = false;
  selectedSucursal: number | string = '';
  
  filtros: FiltrosPedidos = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadSucursales();
    this.loadPedidos();
  }

  loadUserData() {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadSucursales() {
    // Simulación de sucursales
    this.sucursales = [
      { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
      { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
      { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789' }
    ];
  }

  loadPedidos() {
    // Simulación de pedidos filtrados por sucursal del usuario
    const allPedidos = [
      {
        id: 1,
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
        fecha: new Date(),
        estado: 'En proceso' as const,
        prendas: [
          {
            categoria: { id: 1, nombre: 'Camisa', precio_base: 15000 },
            servicios: [
              { id: 1, nombre: 'Lavado', precio_adicional: 5000 },
              { id: 2, nombre: 'Planchado', precio_adicional: 8000 }
            ],
            observaciones: 'Mancha en el cuello',
            subtotal: 28000
          }
        ],
        total: 28000,
        observaciones: 'Cliente prioritario'
      },
      {
        id: 2,
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
        fecha: new Date(Date.now() - 3600000),
        estado: 'En camino' as const,
        prendas: [
          {
            categoria: { id: 2, nombre: 'Pantalón', precio_base: 20000 },
            servicios: [
              { id: 1, nombre: 'Lavado', precio_adicional: 5000 }
            ],
            observaciones: '',
            subtotal: 25000
          }
        ],
        total: 25000
      },
      {
        id: 3,
        sucursal: { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
        fecha: new Date(Date.now() - 7200000),
        estado: 'Entregado' as const,
        prendas: [
          {
            categoria: { id: 3, nombre: 'Vestido', precio_base: 35000 },
            servicios: [
              { id: 1, nombre: 'Lavado', precio_adicional: 5000 },
              { id: 2, nombre: 'Planchado', precio_adicional: 8000 },
              { id: 3, nombre: 'Secado', precio_adicional: 3000 }
            ],
            observaciones: 'Tela delicada',
            subtotal: 51000
          }
        ],
        total: 51000
      },
      {
        id: 4,
        sucursal: { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789' },
        fecha: new Date(Date.now() - 10800000),
        estado: 'En proceso' as const,
        prendas: [
          {
            categoria: { id: 1, nombre: 'Camisa', precio_base: 15000 },
            servicios: [
              { id: 1, nombre: 'Lavado', precio_adicional: 5000 }
            ],
            observaciones: '',
            subtotal: 20000
          }
        ],
        total: 20000
      }
    ];

    let filteredPedidos = [...allPedidos];

    // Filtrar por sucursal según el rol del usuario
    if (this.currentUser?.rol === 'empleado' && this.currentUser.sucursal) {
      // Empleados solo ven pedidos de su sucursal
      filteredPedidos = filteredPedidos.filter(p => p.sucursal.id === this.currentUser?.sucursal?.id);
    } else if ((this.currentUser?.rol === 'admin' || this.currentUser?.rol === 'central') && this.selectedSucursal) {
      // Admin/Central pueden filtrar por sucursal específica
      filteredPedidos = filteredPedidos.filter(p => p.sucursal.id === this.selectedSucursal);
    }

    this.pedidos = filteredPedidos;

    // Aplicar filtros adicionales
    this.applyCurrentFilters();
  }

  applyCurrentFilters() {
    let filtered = [...this.pedidos];

    if (this.filtros.estado) {
      filtered = filtered.filter(p => p.estado === this.filtros.estado);
    }

    if (this.filtros.fecha_inicio) {
      filtered = filtered.filter(p => p.fecha >= this.filtros.fecha_inicio!);
    }

    if (this.filtros.fecha_fin) {
      filtered = filtered.filter(p => p.fecha <= this.filtros.fecha_fin!);
    }

    if (this.filtros.sucursal) {
      filtered = filtered.filter(p => p.sucursal.id === this.filtros.sucursal);
    }

    this.pedidos = filtered;
  }

  applyFilters() {
    this.showFilterModal = false;
    this.loadPedidos();
  }

  clearFilter(filterType: string) {
    switch (filterType) {
      case 'estado':
        this.filtros.estado = undefined;
        break;
      case 'fecha':
        this.filtros.fecha_inicio = undefined;
        this.filtros.fecha_fin = undefined;
        break;
      case 'sucursal':
        this.filtros.sucursal = undefined;
        break;
    }
    this.loadPedidos();
  }

  clearAllFilters() {
    this.filtros = {};
    this.showFilterModal = false;
    this.loadPedidos();
  }

  hasActiveFilters(): boolean {
    return !!(this.filtros.estado || this.filtros.fecha_inicio || this.filtros.sucursal);
  }

  getSucursalName(id: number): string {
    const sucursal = this.sucursales.find(s => s.id === id);
    return sucursal ? sucursal.nombre : '';
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'En proceso': return 'warning';
      case 'En camino': return 'primary';
      case 'Entregado': return 'success';
      default: return 'medium';
    }
  }

  crearPedido() {
    this.router.navigate(['/detalle-pedido']);
  }

  verDetalle(id: number) {
    this.router.navigate(['/detalle-pedido', id]);
  }

  onSucursalChange() {
    this.loadPedidos();
  }
}