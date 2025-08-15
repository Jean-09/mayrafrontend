import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Pedido, FiltrosPedidos } from '../../models/pedido.model';
import { Sucursal } from '../../models/user.model';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false
})
export class PedidosPage implements OnInit {
  currentUser: any;
  pedidos: any[] = [];
  sucursales: any[] = [];
  showFilterModal = false;
  selectedSucursal: number | string = '';

  filtros: FiltrosPedidos = {};

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private authservice: AuthService,
    private api: ApiService,
    private router: Router,
    private storage: Storage
  ) { }

  async ngOnInit() {
    // this.loadUserData();    // this.loadUserData();

    await this.storage.create();
    await this.getToken();
    await this.loadSucursales();
    await this.loadPedidos();

    // Obtén el token y el usuario guardados
    const tokenData = await this.storage.get('token');
    console.log('este es mis datos del token', tokenData)
    this.usuario = tokenData.user
    if (tokenData?.token && tokenData?.user) {
      this.currentUser = tokenData.user;
      console.log('este es el usuario', this.usuario)


    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }
    console.log(this.currentUser)

  }

  usuario: any;
  token = '';

  async getToken() {
    const tokenData = await this.storage.get('token');
    console.log('este es el data del token', tokenData)
    if (tokenData?.token && tokenData?.user) {
      this.token = tokenData.token;
      console.log('token:', this.token);
    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }
  }

  // loadUserData() {
  //   this.api.getUser().then((res)=>{
  //     this.currentUser = res;
  //   }).catch((error)=>{
  //     console.log(error)
  //   })


  // }

  loadSucursales() {
    this.api.getSucursales(this.token).then((res) => {
      this.sucursales = res;
      console.log('sucursales totales', this.sucursales)
    }).catch((error) => {
      console.log(error)
    })
  }

  async loadPedidos() {
    await this.api.getAllPedidos(this.token).then((res) => {
      const allPedidos = res;

      let filteredPedidos = [...allPedidos];

      // Filtrar por sucursal según el rol del usuario
      if (this.currentUser?.role.name === 'empleado' && this.currentUser.sucursal) {
        // Empleados solo ven pedidos de su sucursal
        filteredPedidos = filteredPedidos.filter(p => p.sucursal.id === this.currentUser?.sucursal?.id);
      } else if ((this.currentUser?.role.name === 'admin' || this.currentUser?.role.name === 'central') && this.selectedSucursal) {
        // Admin/Central pueden filtrar por sucursal específica
        filteredPedidos = filteredPedidos.filter(p => p.sucursal.documentId === this.selectedSucursal);
      }

      this.pedidos = filteredPedidos;
      console.log(this.pedidos)

      // Aplicar filtros adicionales
      this.applyCurrentFilters();
    }).catch((error) => {
      console.log(error)
    })


  }

  applyCurrentFilters() {
    let filtered = [...this.pedidos];

    // Filtro por estado
    if (this.filtros.estado) {
      filtered = filtered.filter(p => p.estado === this.filtros.estado);
    }

    // Filtro por fecha de inicio (exacta)
    if (this.filtros.fecha_inicio) {
      const fechaInicio = this.formatDateToYYYYMMDD(this.filtros.fecha_inicio);
      filtered = filtered.filter(p => {
        const pedidoFecha = this.formatDateToYYYYMMDD(p.fecha);
        return pedidoFecha === fechaInicio; // Comparación exacta (no >=)
      });
    }

    // Filtro por fecha de fin (exacta)
    if (this.filtros.fecha_fin) {
      const fechaFin = this.formatDateToYYYYMMDD(this.filtros.fecha_fin);
      filtered = filtered.filter(p => {
        const pedidoFechaFin = this.formatDateToYYYYMMDD(p.fecha_entrega);
        return pedidoFechaFin === fechaFin; // Comparación exacta (no <=)
      });
    }

    // Filtro por sucursal
    if (this.filtros.sucursal) {
      filtered = filtered.filter(p => p.sucursal.documentId === this.filtros.sucursal);
    }

    this.pedidos = filtered;
  }

  // Método auxiliar para formatear fechas de manera confiable
  private formatDateToYYYYMMDD(dateInput: Date | string): string {
    if (!dateInput) return '';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateInput);
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Método auxiliar modificado para aceptar Date | string
  private extraerFechaLocal(fecha: Date | string): string {
    if (!fecha) return '';

    // Convertimos a Date si es string
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

    if (isNaN(fechaObj.getTime())) throw new Error(`Fecha inválida: ${fecha}`);

    // Formato YYYY-MM-DD (local, sin UTC)
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
    const sucursal = this.sucursales.find(s => s.documentId === id);
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

  verDetalle(pedido:any) {
    this.router.navigate(['/detalle-pedido'], {
      state: {
        pedido: pedido
      }
    })
  }

  onSucursalChange() {
    this.loadPedidos();
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

}