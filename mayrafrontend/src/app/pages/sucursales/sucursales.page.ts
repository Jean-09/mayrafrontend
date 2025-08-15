import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User, Sucursal } from '../../models/user.model';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.page.html',
  styleUrls: ['./sucursales.page.scss'],
  standalone: false
})
export class SucursalesPage implements OnInit {
  currentUser: User | null = null;
  sucursales: Sucursal[] = [];
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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
    this.loadSucursales();
    this.loadEmpleados();
  }

  loadUserData() {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadSucursales() {
    // Simulación de sucursales
    this.sucursales = [
      { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123, Centro' },
      { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456, Zona Norte' },
      { id: 3, nombre: 'Sucursal Sur', direccion: 'Carrera Sur 789, Zona Sur' },
      { id: 4, nombre: 'Sucursal Oriente', direccion: 'Calle Oriente 101, Zona Oriental' }
    ];
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
    // Simulación de estadísticas por sucursal
    const stats = {
      1: { pedidos: 145, empleados: 2, ventas: 2450000 },
      2: { pedidos: 98, empleados: 2, ventas: 1890000 },
      3: { pedidos: 67, empleados: 1, ventas: 1230000 },
      4: { pedidos: 23, empleados: 0, ventas: 450000 }
    };
    
    return stats[sucursalId as keyof typeof stats] || { pedidos: 0, empleados: 0, ventas: 0 };
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
}