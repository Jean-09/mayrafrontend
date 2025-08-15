import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false
})
export class ReportesPage implements OnInit {
  currentUser: User | null = null;
  
  // Estadísticas generales
  totalSucursales = 4;
  totalPedidos = 333;
  totalVentas = 5020000;
  totalEmpleados = 8;
  
  // Estadísticas por sucursal
  sucursalesStats = [
    {
      nombre: 'Sucursal Centro',
      pedidos: 145,
      ventas: 2450000,
      empleados: 3,
      inventario: 12,
      performance: 92
    },
    {
      nombre: 'Sucursal Norte',
      ventas: 1890000,
      empleados: 2,
      inventario: 8,
      performance: 85
    },
    {
      nombre: 'Sucursal Sur',
      pedidos: 67,
      ventas: 1230000,
      empleados: 1,
      inventario: 6,
      performance: 78
    },
    {
      nombre: 'Sucursal Oriente',
      pedidos: 23,
      ventas: 450000,
      empleados: 0,
      inventario: 3,
      performance: 45
    }
  ];
  
  // Estados de pedidos
  estadosPedidos = {
    enProceso: 45,
    enCamino: 23,
    entregados: 265
  };
  
  // Inventario crítico
  inventarioCritico = [
    {
      producto: 'Quitamanchas',
      sucursal: 'Sucursal Centro',
      cantidad: 3
    },
    {
      producto: 'Suavizante',
      sucursal: 'Sucursal Norte',
      cantidad: 5
    },
    {
      producto: 'Detergente Premium',
      sucursal: 'Sucursal Sur',
      cantidad: 2
    }
  ];
  
  // Distribución de empleados
  empleadosDistribution = [
    {
      sucursal: 'Sucursal Centro',
      empleados: 3,
      percentage: 37.5
    },
    {
      sucursal: 'Sucursal Norte',
      empleados: 2,
      percentage: 25
    },
    {
      sucursal: 'Sucursal Sur',
      empleados: 1,
      percentage: 12.5
    },
    {
      sucursal: 'Sucursal Oriente',
      empleados: 0,
      percentage: 0
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  getPerformanceColor(performance: number): string {
    if (performance >= 90) return 'success';
    if (performance >= 70) return 'warning';
    return 'danger';
  }
}