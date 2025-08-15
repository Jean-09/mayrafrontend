import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ItemInventario, ResumenInventario } from '../../models/inventario.model';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: false
})
export class InventarioPage implements OnInit {
  currentUser: User | null = null;
  selectedSegment = 'resumen';
  selectedSucursal: number = 0;
  sucursales: any[] = [];
  currentSucursalName: string = '';
  resumenInventario: ResumenInventario[] = [];
  movimientos: ItemInventario[] = [];
  
  showAddModal = false;
  showMovimientoModal = false;
  
  nuevoProducto = {
    producto: '',
    cantidad: 0,
    observaciones: ''
  };
  
  movimientoData = {
    producto: '',
    tipo_movimiento: 'entrada' as 'entrada' | 'salida',
    cantidad: 0,
    observaciones: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
    this.loadSucursales();
    this.loadResumenInventario();
    this.loadMovimientos();
  }

  loadUserData() {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
      
      // Para empleados, asignar automáticamente su sucursal
      if (user?.rol === 'empleado' && user.sucursal) {
        this.selectedSucursal = user.sucursal.id;
        this.currentSucursalName = user.sucursal.nombre;
      }
    });
  }

  loadSucursales() {
    // Simulación de sucursales
    this.sucursales = [
      { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
      { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
      { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789' }
    ];

    // Si es admin y no hay sucursal seleccionada, seleccionar la primera
    if (this.currentUser?.rol === 'admin' && !this.selectedSucursal) {
      this.selectedSucursal = this.sucursales[0].id;
      this.currentSucursalName = this.sucursales[0].nombre;
    }
  }

  loadResumenInventario() {
    // Simulación de resumen de inventario
    this.resumenInventario = [
      {
        producto: 'Bolsas de Lavandería',
        cantidad_total: 150,
        ultimo_movimiento: new Date(Date.now() - 86400000) // Hace 1 día
      },
      {
        producto: 'Detergente Premium',
        cantidad_total: 25,
        ultimo_movimiento: new Date(Date.now() - 172800000) // Hace 2 días
      },
      {
        producto: 'Suavizante',
        cantidad_total: 12,
        ultimo_movimiento: new Date(Date.now() - 259200000) // Hace 3 días
      },
      {
        producto: 'Etiquetas',
        cantidad_total: 500,
        ultimo_movimiento: new Date(Date.now() - 345600000) // Hace 4 días
      },
      {
        producto: 'Quitamanchas',
        cantidad_total: 8,
        ultimo_movimiento: new Date(Date.now() - 432000000) // Hace 5 días
      },
      {
        producto: 'Perchas',
        cantidad_total: 80,
        ultimo_movimiento: new Date(Date.now() - 518400000) // Hace 6 días
      }
    ];
  }

  loadMovimientos() {
    // Simulación de movimientos de inventario
    const allMovimientos = [
      {
        id: 1,
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
        producto: 'Bolsas de Lavandería',
        cantidad: 50,
        tipo_movimiento: 'entrada' as const,
        fecha: new Date(Date.now() - 86400000),
        observaciones: 'Pedido semanal'
      },
      {
        id: 2,
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
        producto: 'Detergente Premium',
        cantidad: 10,
        tipo_movimiento: 'salida' as const,
        fecha: new Date(Date.now() - 172800000),
        observaciones: 'Uso diario'
      },
      {
        id: 3,
        sucursal: { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
        producto: 'Suavizante',
        cantidad: 15,
        tipo_movimiento: 'entrada' as const,
        fecha: new Date(Date.now() - 259200000),
        observaciones: 'Reposición'
      },
      {
        id: 4,
        sucursal: { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789' },
        producto: 'Etiquetas',
        cantidad: 100,
        tipo_movimiento: 'salida' as const,
        fecha: new Date(Date.now() - 345600000),
        observaciones: 'Pedidos del día'
      },
      {
        id: 5,
        sucursal: { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
        producto: 'Quitamanchas',
        cantidad: 5,
        tipo_movimiento: 'entrada' as const,
        fecha: new Date(Date.now() - 432000000),
        observaciones: 'Stock bajo'
      }
    ];

    // Filtrar por sucursal seleccionada
    if (this.selectedSucursal) {
      this.movimientos = allMovimientos.filter(m => m.sucursal.id === this.selectedSucursal);
    } else {
      this.movimientos = allMovimientos;
    }
  }

  segmentChanged() {
    if (this.selectedSegment === 'resumen') {
      this.loadResumenInventario();
    } else {
      this.loadMovimientos();
    }
  }

  openMovimientoModal(producto: string, tipo: 'entrada' | 'salida') {
    this.movimientoData = {
      producto,
      tipo_movimiento: tipo,
      cantidad: 0,
      observaciones: ''
    };
    this.showMovimientoModal = true;
  }

  agregarProducto() {
    if (this.nuevoProducto.producto && this.nuevoProducto.cantidad > 0) {
      // Aquí se agregaría el producto a la API
      console.log('Agregando producto:', this.nuevoProducto);
      
      // Agregar al resumen local
      this.resumenInventario.push({
        producto: this.nuevoProducto.producto,
        cantidad_total: this.nuevoProducto.cantidad,
        ultimo_movimiento: new Date()
      });
      
      // Resetear formulario
      this.nuevoProducto = {
        producto: '',
        cantidad: 0,
        observaciones: ''
      };
      
      this.showAddModal = false;
    }
  }

  registrarMovimiento() {
    if (this.movimientoData.cantidad > 0) {
      // Aquí se registraría el movimiento en la API
      console.log('Registrando movimiento:', this.movimientoData);
      
      // Agregar al historial local
      const nuevoMovimiento: ItemInventario = {
        id: Date.now(),
        sucursal: this.currentUser?.sucursal || { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
        producto: this.movimientoData.producto,
        cantidad: this.movimientoData.cantidad,
        tipo_movimiento: this.movimientoData.tipo_movimiento,
        fecha: new Date(),
        observaciones: this.movimientoData.observaciones
      };
      
      this.movimientos.unshift(nuevoMovimiento);
      
      // Actualizar resumen
      const itemResumen = this.resumenInventario.find(item => 
        item.producto === this.movimientoData.producto
      );
      
      if (itemResumen) {
        if (this.movimientoData.tipo_movimiento === 'entrada') {
          itemResumen.cantidad_total += this.movimientoData.cantidad;
        } else {
          itemResumen.cantidad_total -= this.movimientoData.cantidad;
        }
        itemResumen.ultimo_movimiento = new Date();
      }
      
      this.showMovimientoModal = false;
    }
  }

  getEmptyState(): boolean {
    if (this.selectedSegment === 'resumen') {
      return this.resumenInventario.length === 0;
    } else {
      return this.movimientos.length === 0;
    }
  }

  getEmptyMessage(): string {
    if (this.selectedSegment === 'resumen') {
      return 'No hay productos en el inventario';
    } else {
      return 'No hay movimientos registrados';
    }
  }

  onSucursalChange() {
    const sucursal = this.sucursales.find(s => s.id === this.selectedSucursal);
    this.currentSucursalName = sucursal ? sucursal.nombre : '';
    this.loadResumenInventario();
    this.loadMovimientos();
  }
}