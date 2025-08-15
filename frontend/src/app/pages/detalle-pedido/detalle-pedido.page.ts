import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Pedido, PrendaPedido, CategoriaPrenda, Servicio } from '../../models/pedido.model';
import { Sucursal } from '../../models/user.model';
import { ApiService } from 'src/app/services/api.service';
import { Storage } from '@ionic/storage-angular';
import { AlertController, ToastController } from '@ionic/angular';

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

  categorias: any[] = [];
  servicios: any[] = [];
  sucursales: any[] = [];
  isEditing = false;
  pedidoId: number | null = null;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private api: ApiService,
    private storage: Storage
  ) { }

async ngOnInit() {
  await this.storage.create();
  await this.getToken();

  await this.loadCategorias();
  await this.loadServicios();
  await this.loadSucursales();

  const tokenData = await this.storage.get('token');
  console.log('este es mis datos del token', tokenData);
  this.usuario = tokenData.user;
  
  if (tokenData?.token && tokenData?.user) {
    this.currentUser = tokenData.user;
    console.log('este es el usuario', this.usuario);
  } else {
    this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
    this.router.navigate(['/login']);
  }

  // Verifica si hay un pedido en el estado de la navegación
  this.route.params.subscribe(params => {
    if (history.state.pedido) {
      this.loadPedido();
    } else {
      // Si no hay pedido, inicializa uno nuevo
      this.initializeNewPedido();
    }
  });
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
  //   this.authService.getUser().subscribe(user => {
  //     this.currentUser = user;
  //   });
  // }

  async loadCategorias() {
    await this.api.getCategorias(this.token).then((res) => {
      this.categorias = res.data.data
      console.log(this.categorias)
    }).catch((error) => {
      console.log(error)
    })

  }

  async loadServicios() {
    await this.api.getServicios(this.token).then((res) => {
      this.servicios = res.data.data
    }).catch((error) => {
      console.log(error)
    })
  }

  async loadSucursales() {
    await this.api.getSucursal(this.token).then((res) => {
      this.sucursales = res.data.data
    }).catch((error) => {
      console.log(error)
    })
    
  }

  initializeNewPedido() {
    // Asignar sucursal automáticamente para empleados
    if (this.currentUser?.rol === 'empleado' && this.currentUser.sucursal) {
      this.pedido.sucursal = this.currentUser.sucursal;
    }
  }

loadPedido() {
  const pedidoExistente = history.state.pedido;
  console.log('Pedido cargado desde estado:', pedidoExistente);
  
  if (pedidoExistente) {
    // Asegúrate de que las fechas son objetos Date
    pedidoExistente.fecha = new Date(pedidoExistente.fecha);
    
    // Asigna el pedido cargado al pedido del componente
    this.pedido = {
      ...pedidoExistente,
      prendas: pedidoExistente.prendas.map((prenda:any) => ({
        ...prenda,
        // Asegúrate de que las categorías y servicios coincidan con los arrays cargados
        categoria: this.categorias.find(c => c.id === prenda.categoria.id) || prenda.categoria,
        servicios: prenda.servicios.map((serv:any) => 
          this.servicios.find(s => s.id === serv.id) || serv
        )
      }))
    };
    
    this.isEditing = true; // Indica que estamos editando un pedido existente
    this.pedidoId = pedidoExistente.id;
    this.calcularTotal(); // Recalcula el total por si acaso
  } else {
    console.log('No se encontró pedido en el estado');
    this.initializeNewPedido();
  }
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

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}