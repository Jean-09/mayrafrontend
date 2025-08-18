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
  currentUser: any;
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
        prendas: pedidoExistente.prendas.map((prenda: any) => ({
          ...prenda,
          // Asegúrate de que las categorías y servicios coincidan con los arrays cargados
          categoria: this.categorias.find(c => c.id === prenda.categoria.id) || prenda.categoria,
          servicios: prenda.servicios.map((serv: any) =>
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
      categoria: this.categorias[0]?.documentId || null, // Solo el ID
      servicios: [], // Array de IDs
      observaciones: '',
      subtotal: 0
    };
    this.pedido.prendas.push(nuevaPrenda);
  }

  eliminarPrenda(index: number) {
    this.pedido.prendas.splice(index, 1);
    this.calcularTotal();
  }

  calcularSubtotal(index: number) {
    const prenda = this.pedido.prendas[index];

    // 1. Encuentra la categoría seleccionada
    const categoriaSeleccionada = this.categorias.find(
      cat => cat.documentId === prenda.categoria
    );

    // 2. Calcula precio base (si existe la categoría)
    const precioBase = categoriaSeleccionada?.precio_base || 0;

    // 3. Calcula total de servicios adicionales
    let serviciosTotal = 0;
    if (prenda.servicios && prenda.servicios.length > 0) {
      serviciosTotal = this.servicios
        .filter(serv => prenda.servicios.includes(serv.documentId))
        .reduce((sum, serv) => sum + (serv.precio_adicional || 0), 0);
    }

    // 4. Asigna el subtotal
    prenda.subtotal = precioBase + serviciosTotal;

    // 5. Actualiza el total general
    this.calcularTotal();
  }

  calcularTotal() {
    this.pedido.total = this.pedido.prendas.reduce((total, prenda) => {
      return total + prenda.subtotal;
    }, 0);
  }

  isFormValid() {
    console.log(this.pedido.prendas)
    return this.pedido.prendas.length > 0 &&
      this.pedido.prendas.every(prenda => prenda.categoria)
  }

  private calcularFechaEntrega(fechaPedido: Date | string): string {
    const fecha = new Date(fechaPedido);

    // Ajuste para horario local (opcional)
    const offset = fecha.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(fecha.getTime() - offset);

    // Agregar 24 horas exactas
    const fechaEntrega = new Date(fechaLocal.getTime() + 24 * 60 * 60 * 1000);

    return fechaEntrega.toISOString().split('T')[0] + 'T23:59:59.999Z'; // Para entregar al final del día
  }

  async guardarPedido() {
    if (!this.isFormValid()) {
      this.mostrarToast('Completa todos los campos obligatorios', 'danger');
      return;
    }

    try {

      const ultimoNumero = await this.api.obtenerUltimoNumeroPedido(this.token);
      console.log('este es el ultimo numero',ultimoNumero)
      const nuevoNumero = ultimoNumero + 1;
      // 1. Crear primero el pedido (sin prendas)
      const Data = {
        sucursal: this.pedido.sucursal?.documentId,
        fecha: this.pedido.fecha,
        estado: this.pedido.estado,
        observaciones: this.pedido.observaciones,
        total: this.pedido.total,
        users_permissions_user: this.currentUser?.documentId,
        fecha_entrega: this.calcularFechaEntrega(this.pedido.fecha),
        numero_pedido: nuevoNumero
      };
      console.log(Data)

      const pedidoCreado = await this.api.postPediodos(this.token, Data);
      const pedidoId = pedidoCreado.data.data.documentId; // ID del nuevo pedido

      // 2. Crear las prendas asociadas al pedido
      await this.guardarPrendasPedido(pedidoId);

      // 3. Feedback y redirección
      this.mostrarToast('Pedido guardado exitosamente', 'success');
      this.router.navigate(['/pedidos']);

    } catch (error) {
      console.error('Error al guardar pedido:', error);
      this.mostrarToast('Error al guardar el pedido', 'danger');
    }
  }

  async guardarPrendasPedido(pedidoId: string) {
    for (const prenda of this.pedido.prendas) {
      const data = {
        pedido: pedidoId, // Relación con el pedido
        categoria_prenda: prenda.categoria,
        servicios: prenda.servicios,
        cantidad: 1,
        subtotal: prenda.subtotal,
        observaciones: prenda.observaciones
      };

      await this.api.postPrendas(this.token, data);
    }
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color
    }).then(toast => toast.present());
  }

  compareCategorias(c1: any, c2: any): boolean {
    // Compara IDs directamente (c1 y c2 son IDs, no objetos)
    return c1 === c2;
  }

  compareServicios(s1: any, s2: any): boolean {
    // Para selección múltiple, compara IDs
    return s1 === s2;
  }

  compareSucursales(s1: any, s2: any): boolean {
    return s1 && s2 ? s1.documentId === s2.documentId : s1 === s2;
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