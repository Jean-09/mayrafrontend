import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Pedido } from '../../models/pedido.model';
import { ApiService } from 'src/app/services/api.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  metrics = {
    totalPedidos: 0,
    pedidosEnProceso: 0,
    pedidosEntregados: 0,
    ventasHoy: 0
  };
  pedidosRecientes: Pedido[] = [];

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private router: Router,
    private storage:Storage,
    private route:Router
  ) {}


  async ngOnInit() {

    await this.storage.create();
    await this.getToken();
    await this.loadUserData();
    await this.loadMetrics();
    await this.loadPedidosRecientes();
  }
  token='';

    async getToken() {
    const token = await this.storage.get('token');
    this.token= token.token
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  loadUserData() {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  pedido: any[]=[];

loadMetrics() {
  this.api.getPedido(this.token).then((res) => {
    this.pedido = res.data.data;
    console.log(this.pedido);
    
    const pedidos = res.data.data;
    const hoy = new Date().toISOString().split('T')[0];

    // 1. Métricas principales
    const totalPedidos = pedidos.length;
    const pedidosEnProceso = pedidos.filter((p: any) => p.estado === 'En proceso').length;
    const pedidosEntregadosHoy = pedidos.filter((p: any) => 
      p.estado === 'Entregado' && 
      p.fecha_entrega && 
      p.fecha_entrega.split('T')[0] === hoy
    ).length;
    
    const ventasHoy = pedidos
      .filter((p: any) => 
        p.estado === 'Entregado' && 
        p.fecha_entrega && 
        p.fecha_entrega.split('T')[0] === hoy
      )
      .reduce((sum: number, p: any) => sum + (p.total || 0), 0);

    // 2. Pedidos recientes (últimos 5 pedidos)
    this.pedidosRecientes = pedidos
      .sort((a: any, b: any) => 
        new Date(b.fecha_creacion || 0).getTime() - new Date(a.fecha_creacion || 0).getTime()
      )
      .slice(0, 5); // Tomamos los 5 más recientes

    this.metrics = {
      totalPedidos: totalPedidos,
      pedidosEnProceso: pedidosEnProceso,
      pedidosEntregados: pedidosEntregadosHoy,
      ventasHoy: ventasHoy
    };
    
  }).catch((error) => {
    console.log(error);
    this.metrics = {
      totalPedidos: 0,
      pedidosEnProceso: 0,
      pedidosEntregados: 0,
      ventasHoy: 0
    };
    this.pedidosRecientes = []; // Array vacío en caso de error
  });
}

  loadPedidosRecientes() {
    // // Simulación de pedidos recientes
    // this.pedidosRecientes = [
    //   {
    //     id: 1,
    //     sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
    //     fecha: new Date(),
    //     estado: 'En proceso',
    //     prendas: [],
    //     total: 45000
    //   },
    //   {
    //     id: 2,
    //     sucursal: { id: 1, nombre: 'Sucursal Centro', direccion: 'Calle Principal 123' },
    //     fecha: new Date(Date.now() - 3600000),
    //     estado: 'En camino',
    //     prendas: [],
    //     total: 32000
    //   },
    //   {
    //     id: 3,
    //     sucursal: { id: 2, nombre: 'Sucursal Norte', direccion: 'Avenida Norte 456' },
    //     fecha: new Date(Date.now() - 7200000),
    //     estado: 'Entregado',
    //     prendas: [],
    //     total: 28000
    //   }
    // ];
  }

  getRoleText(role: string | undefined): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'empleado': return 'Empleado de Sucursal';
      case 'central': return 'Lavandería Central';
      default: return '';
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'En proceso': return 'warning';
      case 'En camino': return 'primary';
      case 'Entregado': return 'success';
      default: return 'medium';
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}