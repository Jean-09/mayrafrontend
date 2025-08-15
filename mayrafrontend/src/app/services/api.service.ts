import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { AuthService } from './auth.service';
import { Pedido, FiltrosPedidos, CategoriaPrenda, Servicio } from '../models/pedido.model';
import { ItemInventario, ResumenInventario } from '../models/inventario.model';
import { Sucursal } from '../models/user.model';
import axios, { AxiosRequestConfig, AxiosHeaders } from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api= environment.urlapi;

  constructor(private authService: AuthService) {}

  private getConfig(): AxiosRequestConfig {
    const token = this.authService.getToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getPedido(token:string){
    console.log('este es el token', token)
     const options = new AxiosHeaders({
    'Authorization': 'Bearer ' + token
  });
  return axios.get(`${this.api}/pedidos`, { headers: options });
  }

  // Pedidos
  getPedidos(filtros: FiltrosPedidos = {}): Observable<Pedido[]> {
    let params = new URLSearchParams();
    
    if (filtros.fecha_inicio) {
      params.append('fecha_gte', filtros.fecha_inicio.toISOString());
    }
    if (filtros.fecha_fin) {
      params.append('fecha_lte', filtros.fecha_fin.toISOString());
    }
    if (filtros.estado) {
      params.append('estado', filtros.estado);
    }
    if (filtros.sucursal) {
      params.append('sucursal', filtros.sucursal.toString());
    }

    return from(
      axios.get(`${this.api}/pedidos?${params.toString()}`, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  // getPedido(id: number): Observable<Pedido> {
  //   return from(
  //     axios.get(`${this.api}/pedidos/${id}`, this.getConfig())
  //       .then(response => response.data.data)
  //   );
  // }

  createPedido(pedido: Partial<Pedido>): Observable<Pedido> {
    return from(
      axios.post(`${this.api}/pedidos`, { data: pedido }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return from(
      axios.put(`${this.api}/pedidos/${id}`, { data: pedido }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  // Categorías y Servicios
  getCategorias(): Observable<CategoriaPrenda[]> {
    return from(
      axios.get(`${this.api}/categorias-prendas`, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  getServicios(): Observable<Servicio[]> {
    return from(
      axios.get(`${this.api}/servicios`, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  // Inventario
  getInventario(sucursalId?: number): Observable<ItemInventario[]> {
    let url = `${this.api}/inventario`;
    if (sucursalId) {
      url += `?sucursal=${sucursalId}`;
    }
    
    return from(
      axios.get(url, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  getResumenInventario(sucursalId?: number): Observable<ResumenInventario[]> {
    let url = `${this.api}/inventario/resumen`;
    if (sucursalId) {
      url += `?sucursal=${sucursalId}`;
    }
    
    return from(
      axios.get(url, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  createMovimientoInventario(movimiento: Partial<ItemInventario>): Observable<ItemInventario> {
    return from(
      axios.post(`${this.api}/inventario`, { data: movimiento }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  // Sucursales
  getSucursales(): Observable<Sucursal[]> {
    return from(
      axios.get(`${this.api}/sucursales`, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  getSucursal(id: number): Observable<Sucursal> {
    return from(
      axios.get(`${this.api}/sucursales/${id}`, this.getConfig())
        .then(response => response.data.data)
    );
  }

  createSucursal(sucursal: Partial<Sucursal>): Observable<Sucursal> {
    return from(
      axios.post(`${this.api}/sucursales`, { data: sucursal }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  updateSucursal(id: number, sucursal: Partial<Sucursal>): Observable<Sucursal> {
    return from(
      axios.put(`${this.api}/sucursales/${id}`, { data: sucursal }, this.getConfig())
        .then(response => response.data.data)
    );
  }
}