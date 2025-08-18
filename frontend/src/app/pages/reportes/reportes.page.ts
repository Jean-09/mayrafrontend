import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false
})
export class ReportesPage implements OnInit {
  currentUser: any;

  // Estadísticas generales
  // Variables para datos dinámicos
  totalSucursales = 0;
  totalPedidos = 0;
  totalPedidosSucursal = 0;
  totalVentas = 0;
  totalEmpleados = 0;
  totalEmpleadosSucursal = 0;
  totalInventario = 0;
  sucursalesStats: any[] = [];
  estadosPedidos: any = {};
  inventarioCritico: any[] = [];
  empleadosDistribution: any[] = [];

  //   totalSucursales = 4;
  // totalPedidos = 333;
  // totalVentas = 5020000;
  // totalEmpleados = 8;

  // // Estadísticas por sucursal
  // sucursalesStats = [
  //   {
  //     nombre: 'Sucursal Centro',
  //     pedidos: 145,
  //     ventas: 2450000,
  //     empleados: 3,
  //     inventario: 12,
  //     performance: 92
  //   },
  //   {
  //     nombre: 'Sucursal Norte',
  //     ventas: 1890000,
  //     empleados: 2,
  //     inventario: 8,
  //     performance: 85
  //   },
  //   {
  //     nombre: 'Sucursal Sur',
  //     pedidos: 67,
  //     ventas: 1230000,
  //     empleados: 1,
  //     inventario: 6,
  //     performance: 78
  //   },
  //   {
  //     nombre: 'Sucursal Oriente',
  //     pedidos: 23,
  //     ventas: 450000,
  //     empleados: 0,
  //     inventario: 3,
  //     performance: 45
  //   }
  // ];

  // // Estados de pedidos
  // estadosPedidos = {
  //   enProceso: 45,
  //   enCamino: 23,
  //   entregados: 265
  // };

  // // Inventario crítico
  // inventarioCritico = [
  //   {
  //     producto: 'Quitamanchas',
  //     sucursal: 'Sucursal Centro',
  //     cantidad: 3
  //   },
  //   {
  //     producto: 'Suavizante',
  //     sucursal: 'Sucursal Norte',
  //     cantidad: 5
  //   },
  //   {
  //     producto: 'Detergente Premium',
  //     sucursal: 'Sucursal Sur',
  //     cantidad: 2
  //   }
  // ];

  // // Distribución de empleados
  // empleadosDistribution = [
  //   {
  //     sucursal: 'Sucursal Centro',
  //     empleados: 3,
  //     percentage: 37.5
  //   },
  //   {
  //     sucursal: 'Sucursal Norte',
  //     empleados: 2,
  //     percentage: 25
  //   },
  //   {
  //     sucursal: 'Sucursal Sur',
  //     empleados: 1,
  //     percentage: 12.5
  //   },
  //   {
  //     sucursal: 'Sucursal Oriente',
  //     empleados: 0,
  //     percentage: 0
  //   }
  // ]; 

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private api: ApiService,
    private router: Router,
    private storage: Storage
  ) { }

  async ngOnInit() {
    // this.loadUserData();
    await this.storage.create();
    await this.getToken();
    await this.loadSucursales();
    await this.getInventarioCritico()

    // Obtén el token y el usuario guardados
    const tokenData = await this.storage.get('token');
    this.usuario = tokenData.user
    if (tokenData?.token && tokenData?.user) {
      this.currentUser = tokenData.user;


    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }

  }

  usuario: any;
  token = '';

  async getToken() {
    const tokenData = await this.storage.get('token');
    if (tokenData?.token && tokenData?.user) {
      this.token = tokenData.token;
    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }
  }


  async loadSucursales() {
    await this.api.getSucursales(this.token).then((res: any[]) => {
      // La respuesta `res` es un array con los datos de las sucursales
      console.log('sucursales totales', res);

      this.sucursalesStats = res;

      this.totalSucursales = res.length;
      this.totalPedidos = res.length;
       this.totalVentas = res.reduce((sum, sucursal) => {
      const pedidosTotalesDeSucursal = sucursal.pedidos.reduce((pedidosSum:any, pedido:any) => {
        return pedidosSum + Number(pedido.total || 0);
      }, 0);
      return sum + pedidosTotalesDeSucursal;
    }, 0);
      this.totalEmpleados = res.length;
      this.totalInventario = res.length;
     
      // Llama a las funciones para el resto de los datos dinámicos
      this.estadosPedidos = this.calcularEstadosPedidos(res)
      this.empleadosDistribution = this.calcularDistribucionEmpleados(res);

    }).catch((error) => {
      console.log('Error al cargar las sucursales', error);
    });
  }

 getInventarioCritico() {
  this.api.getInventario(this.token).then((res: any) => {
    this.inventarioCritico = res.data.data.filter((item:any) => (item.cantidad || 0) < 5);
  }).catch((error) => {
    console.log(error);
  });
}


getSucursalStats(sucursalId: number) {
  const sucursal = this.sucursalesStats.find(s => s.documentId === sucursalId);

  if (!sucursal) {
    return { 
      pedidos: 0, 
      empleados: 0, 
      ventas: 0, 
      inventarios: 0,
      inventarioBajo: false // 👈 Nuevo campo
    };
  }

  const totalVentas = sucursal.pedidos?.reduce((sum: number, pedido: any) => {
    return sum + (pedido.total || 0);
  }, 0) || 0;

  const totalInventarios = sucursal.inventarios?.length || 0; 

  return {
    pedidos: sucursal.pedidos?.length || 0,
    empleados: sucursal.users?.length || 0,
    inventarios: totalInventarios, // 👈 Ahora sí muestra el total
    ventas: totalVentas,
    inventarioBajo: totalInventarios <= 5 // 👈 Nuevo campo booleano
  };
}

private calcularEstadosPedidos(sucursales: any[]): any {
  let estadosPedidos = {
    enProceso: 0,
    enCamino: 0,
    entregados: 0
  };

  sucursales.forEach(sucursal => {
    // Si la sucursal tiene un array de pedidos
    if (sucursal.pedidos && sucursal.pedidos.length > 0) {
      sucursal.pedidos.forEach((pedido: any) => {
        // Usa una sentencia 'switch' o 'if/else' para contar cada estado
        switch (pedido.estado) {
          case 'En proceso':
            estadosPedidos.enProceso++;
            break;
          case 'En camino':
            estadosPedidos.enCamino++;
            break;
          case 'Entregado':
            estadosPedidos.entregados++;
            break;
        }
      });
    }
  });

  return estadosPedidos;
}

  private calcularDistribucionEmpleados(sucursales: any[]): any[] {
    const totalEmpleados = sucursales.reduce((sum, s) => sum + (s.empleados || 0), 0);

    if (totalEmpleados === 0) return []; // Evita división por cero

    return sucursales.map(sucursal => ({
      sucursal: sucursal.nombre,
      empleados: sucursal.empleados || 0,
      percentage: ((sucursal.empleados || 0) / totalEmpleados) * 100
    }));
  }

  getPerformanceColor(performance: number): string {
    if (performance >= 90) return 'success';
    if (performance >= 70) return 'warning';
    return 'danger';
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