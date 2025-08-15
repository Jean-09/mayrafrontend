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
  empleados: User[] = [];
  
  showAddModal = false;
  showDetailModal = false;
  selectedSucursal: Sucursal | null = null;
  editingSucursal = false;
  
  sucursalData = {
    id: 0,
    nombre: '',
    direccion: ''
  };

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private storage: Storage,
    private router: Router,
    private api: ApiService
  ) {}

  async ngOnInit() {
    // this.loadUserData();
    
    await this.storage.create();
    await this.getToken();
    // await this.loadUserData();
    this.loadSucursales();
    this.loadEmpleados();

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

  loadEmpleados() {
    // Simulación de empleados
    this.empleados = [
      {
        id: 2,
        nombre: 'Juan Pérez',
        correo: 'juan@sucursal1.com',
        rol: 'empleado',
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' }
      },
      {
        id: 4,
        nombre: 'María García',
        correo: 'maria@sucursal1.com',
        rol: 'empleado',
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' }
      },
      {
        id: 5,
        nombre: 'Carlos López',
        correo: 'carlos@sucursal2.com',
        rol: 'empleado',
        sucursal: { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' }
      },
      {
        id: 6,
        nombre: 'Ana Martínez',
        correo: 'ana@sucursal2.com',
        rol: 'empleado',
        sucursal: { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' }
      },
      {
        id: 7,
        nombre: 'Luis Rodríguez',
        correo: 'luis@sucursal3.com',
        rol: 'empleado',
        sucursal: { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789' }
      },
      {
        id: 8,
        nombre: 'Carmen Jiménez',
        correo: 'carmen@sucursal1.com',
        rol: 'empleado',
        sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' }
      }
    ];
  }

getSucursalStats(sucursalId: number) {
  const sucursal = this.sucursales.find(s => s.id === sucursalId);
  
  if (!sucursal) {
    return { pedidos: 0, empleados: 0, ventas: 0 };
  }

  return {
    pedidos: sucursal.pedidos?.length || 0,       // Mantén el nombre 'pedidos'
    empleados: sucursal.users?.length || 0,       // Mantén el nombre 'empleados'
    ventas: this.calcularVentas(sucursal.pedidos) // Mantén el nombre 'ventas'
  };
}

private calcularVentas(pedidos: any[] = []): number {
  return pedidos.reduce((total, pedido) => total + (pedido.total || 0), 0);
}

calcularVentasTotales(pedidos: any[]): number {
  return pedidos.reduce((total, pedido) => {
    return total + (pedido.total || 0);
  }, 0);
}

  getEmpleadosSucursal(sucursalId: number): User[] {
    return this.empleados.filter(empleado => empleado.sucursal?.id === sucursalId);
  }

  verDetalle(sucursal: Sucursal) {
    this.selectedSucursal = sucursal;
    this.showDetailModal = true;
  }

  editarSucursal(sucursal: Sucursal) {
    this.editingSucursal = true;
    this.sucursalData = { ...sucursal };
    this.showAddModal = true;
  }

  eliminarSucursal(sucursal: Sucursal) {
    if (confirm(`¿Está seguro de eliminar la sucursal "${sucursal.nombre}"?`)) {
      // Aquí se eliminaría la sucursal de la API
      console.log('Eliminando sucursal:', sucursal);
      
      // Eliminar localmente
      this.sucursales = this.sucursales.filter(s => s.id !== sucursal.id);
    }
  }

  guardarSucursal() {
    if (this.sucursalData.nombre && this.sucursalData.direccion) {
      if (this.editingSucursal) {
        // Actualizar sucursal existente
        const index = this.sucursales.findIndex(s => s.id === this.sucursalData.id);
        if (index !== -1) {
          this.sucursales[index] = { ...this.sucursalData };
        }
      } else {
        // Crear nueva sucursal
        const nuevaSucursal: Sucursal = {
          id: Date.now(),
          nombre: this.sucursalData.nombre,
          direccion: this.sucursalData.direccion
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
      id: 0,
      nombre: '',
      direccion: ''
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