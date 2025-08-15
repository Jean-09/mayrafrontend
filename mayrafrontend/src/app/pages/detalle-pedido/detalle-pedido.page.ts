import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Pedido, PrendaPedido, CategoriaPrenda, Servicio } from '../../models/pedido.model';
import { Sucursal } from '../../models/user.model';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.page.html',
  styleUrls: ['./detalle-pedido.page.scss'],
  standalone: false
})
export class DetallePedidoPage implements OnInit {
  currentUser: User | null = null;
  pedido: Pedido = {
    id: 0,
    sucursal: null,
    fecha: new Date(),
    estado: 'En proceso',
    prendas: [],
    total: 0
  };
  
  categorias: CategoriaPrenda[] = [];
  servicios: Servicio[] = [];
  sucursales: Sucursal[] = [];
  isEditing = false;
  pedidoId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadCategorias();
    this.loadServicios();
    this.loadSucursales();
    
    // Verificar si estamos editando
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pedidoId = +params['id'];
        this.isEditing = true;
        this.loadPedido(this.pedidoId);
      } else {
        this.initializeNewPedido();
      }
    });
  }

  loadUserData() {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadCategorias() {
    // Simulación de categorías
    this.categorias = [
      { id: 1, nombre: 'Camisa', precio_base: 15000 },
      { id: 2, nombre: 'Pantalón', precio_base: 20000 },
      { id: 3, nombre: 'Vestido', precio_base: 35000 },
      { id: 4, nombre: 'Chaqueta', precio_base: 45000 },
      { id: 5, nombre: 'Falda', precio_base: 18000 },
      { id: 6, nombre: 'Corbata', precio_base: 12000 },
      { id: 7, nombre: 'Abrigo', precio_base: 60000 },
      { id: 8, nombre: 'Traje', precio_base: 80000 }
    ];
  }

  loadServicios() {
    // Simulación de servicios
    this.servicios = [
      { id: 1, nombre: 'Lavado', precio_adicional: 5000 },
      { id: 2, nombre: 'Planchado', precio_adicional: 8000 },
      { id: 3, nombre: 'Secado', precio_adicional: 3000 },
      { id: 4, nombre: 'Teñido', precio_adicional: 15000 },
      { id: 5, nombre: 'Arreglo', precio_adicional: 20000 },
      { id: 6, nombre: 'Limpieza en seco', precio_adicional: 12000 }
    ];
  }

  loadSucursales() {
    // Simulación de sucursales
    this.sucursales = [
      { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
      { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
      { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789' }
    ];
  }

  initializeNewPedido() {
    // Asignar sucursal automáticamente para empleados
    if (this.currentUser?.rol === 'empleado' && this.currentUser.sucursal) {
      this.pedido.sucursal = this.currentUser.sucursal;
    }
  }

  loadPedido(id: number) {
    // Simulación de carga de pedido existente
    // En producción, aquí se haría la llamada a la API
    const pedidoExistente = {
      id: id,
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
    };

    this.pedido = pedidoExistente;
  }

  agregarPrenda() {
    const nuevaPrenda: PrendaPedido = {
      categoria: this.categorias[0], // Por defecto primera categoría
      servicios: [],
      observaciones: '',
      subtotal: 0
    };
    
    this.pedido.prendas.push(nuevaPrenda);
    this.calcularSubtotal(this.pedido.prendas.length - 1);
  }

  eliminarPrenda(index: number) {
    this.pedido.prendas.splice(index, 1);
    this.calcularTotal();
  }

  calcularSubtotal(index: number) {
    const prenda = this.pedido.prendas[index];
    if (prenda.categoria) {
      let subtotal = prenda.categoria.precio_base;
      
      if (prenda.servicios) {
        prenda.servicios.forEach(servicio => {
          subtotal += servicio.precio_adicional;
        });
      }
      
      prenda.subtotal = subtotal;
      this.calcularTotal();
    }
  }

  calcularTotal() {
    this.pedido.total = this.pedido.prendas.reduce((total, prenda) => {
      return total + prenda.subtotal;
    }, 0);
  }

  isFormValid(): boolean {
    return this.pedido.prendas.length > 0 && 
           this.pedido.prendas.every(prenda => prenda.categoria) &&
           this.pedido.sucursal !== null;
  }

  guardarPedido() {
    if (this.isFormValid()) {
      // Aquí se guardaría el pedido en la API
      console.log('Guardando pedido:', this.pedido);
      
      // Simulación de guardado exitoso
      this.router.navigate(['/pedidos']);
    }
  }

  // Funciones de comparación para los selects
  compareCategorias(c1: CategoriaPrenda, c2: CategoriaPrenda): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareServicios(s1: Servicio, s2: Servicio): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareSucursales(s1: Sucursal, s2: Sucursal): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }
}