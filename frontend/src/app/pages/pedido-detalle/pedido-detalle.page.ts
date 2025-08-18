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
  selector: 'app-pedido-detalle',
  templateUrl: './pedido-detalle.page.html',
  styleUrls: ['./pedido-detalle.page.scss'],
  standalone: false
})
export class PedidoDetallePage implements OnInit {
  currentUser: any;

pedido: any = {
  documentId: '',
  sucursal: null,
  fecha: new Date(),
  fecha_entrega: '',
  observaciones: '',
  estado: 'En proceso',
  prenda: [], // Cambiado de {} a [] para que sea iterable
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
    await this.getPedidos()

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
  pedidoDetalle: any;
  usuario: any;
  token = '';

async getPedidos() {
  const pedidoData = await history.state.pedidos;
  console.log('Datos del pedido recibidos:', pedidoData);
  
  this.pedido = {
    documentId: pedidoData.documentId || '',
    sucursal: pedidoData.sucursal || null,
    fecha: pedidoData.fecha ? new Date(pedidoData.fecha) : new Date(),
    fecha_entrega: pedidoData.fecha_entrega || '',
    observaciones: pedidoData.observaciones || '',
    estado: pedidoData.estado || 'En proceso',
    prenda: Array.isArray(pedidoData.prenda) ? pedidoData.prenda : [pedidoData.prenda || {}],
    total: pedidoData.total || 0
  };
  
  console.log('Pedido procesado:', this.pedido);
}

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


  mostrarToast(mensaje: string, color: string) {
    this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color
    }).then(toast => toast.present());
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
