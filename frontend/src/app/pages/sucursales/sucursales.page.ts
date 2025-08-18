import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User, Sucursal } from '../../models/user.model';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.page.html',
  styleUrls: ['./sucursales.page.scss'],
  standalone: false
})
export class SucursalesPage implements OnInit {
  currentUser: any;
  sucursales: any[] = [];
  empleados: any[] = [];

  showAddModal = false;
  showDetailModal = false;
  selectedSucursal: any;
  editingSucursal = false;

  sucursalData = {
    documentId: '',
    nombre: '',
    direccion: '',
    telefono: ''
  };

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private storage: Storage,
    private router: Router,
    private api: ApiService
  ) { }

  async ngOnInit() {
    // this.loadUserData();

    await this.storage.create();
    await this.getToken();
    // await this.loadUserData();
    this.loadSucursales();
    this.getpersonal();

    const tokenData = await this.storage.get('token');
    console.log('este es mis datos del token', tokenData);

    if (tokenData?.token && tokenData?.user) {
      this.currentUser = tokenData.user;
      console.log('este es el usuario', this.currentUser);
    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }
  }

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

  sucursalesConEstadisticas: any[] = []; // Nueva propiedad para almacenar sucursales con stats

  async loadSucursales() {
    try {
      const res = await this.api.getSucursales(this.token);
      this.sucursales = res;

      console.log('Sucursales cargadas:', this.sucursales);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
    }
  }



  getSucursalStats(sucursalId: number) {
    const sucursal = this.sucursales.find(s => s.documentId === sucursalId); // 👈 corregido

    if (!sucursal) {
      return { pedidos: 0, empleados: 0, ventas: 0 };
    }

    const totalVentas = sucursal.pedidos?.reduce((sum: number, pedido: any) => {
      return sum + (pedido.total || 0);
    }, 0) || 0;

    return {
      pedidos: sucursal.pedidos?.length || 0,
      empleados: sucursal.users?.length || 0, // 👈 aquí ya cuenta bien
      ventas: totalVentas
    };
  }

  getpersonal() {
    this.api.getPersonal(this.token).then((res) => {
      this.empleados = res
      console.log(this.empleados)
    }).catch((error) => {
      console.log(error)
    })
  }


  private calcularVentas(pedidos: any[] = []): number {
    return pedidos.reduce((total, pedido) => total + (pedido.total || 0), 0);
  }

  calcularVentasTotales(pedidos: any[]): number {
    return pedidos.reduce((total, pedido) => {
      return total + (pedido.total || 0);
    }, 0);
  }

  getEmpleadosSucursal(sucursalId: number) {
    console.log(sucursalId)
    return this.empleados.filter(empleado => empleado.sucursal?.documentId === sucursalId);
  }

  verDetalle(sucursal: any) {
    this.selectedSucursal = sucursal;
    this.showDetailModal = true;
  }

  async editarSucursal(sucursal: any) {
    this.editingSucursal = true;
    this.sucursalData = { ...sucursal };
    this.showAddModal = true;
    console.log(sucursal)


  }

  eliminarSucursal(sucursal: any) {
    if (confirm(`¿Está seguro de eliminar la sucursal "${sucursal.nombre}"?`)) {
      // Aquí se eliminaría la sucursal de la API
      console.log('Eliminando sucursal:', sucursal);

      // Eliminar localmente
      this.sucursales = this.sucursales.filter(s => s.documentId !== sucursal.documentId);
    }
  }

  async guardarSucursal() {
    if (this.sucursalData.nombre && this.sucursalData.direccion && this.sucursalData.telefono) {
      if (this.editingSucursal) {
        // Actualizar sucursal existente
        const data = {
          nombre: this.sucursalData.nombre,
          direccion: this.sucursalData.direccion,
          telefono: this.sucursalData.telefono
        }
        await this.api.updateSucursal(this.sucursalData.documentId, data, this.token);
        this.loadSucursales()
      } else {
        // Crear nueva sucursal
        const nuevaSucursal: any = {
          nombre: this.sucursalData.nombre,
          direccion: this.sucursalData.direccion,
          telefono: this.sucursalData.telefono
        };
        this.sucursales.push(nuevaSucursal);
      }

      this.closeModal();
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.editingSucursal = false;
    this.sucursalData = {
      documentId: '',
      nombre: '',
      direccion: '',
      telefono: ''
    };
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