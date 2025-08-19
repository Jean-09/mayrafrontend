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
  private url = environment.urlapi;

  constructor(private authService: AuthService) { }

  private getConfig(): AxiosRequestConfig {
    const token = this.authService.getToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getPedido(token: string) {
    console.log('este es el token', token)
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.get(`${this.url}/pedidos?populate=*`, { headers: options });
  }

  async getAllPedidos(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = await axios.get(this.url + '/pedidos?populate[sucursal]=true&populate[users_permissions_user]=true&populate[prenda][populate][categoria_prenda]=true&populate[prenda][populate][servicios]=true', { headers: options });
    return res.data.data;
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
      axios.get(`${this.url}/pedidos?${params.toString()}`, this.getConfig())
        .then(response => response.data.data || [])
    );
  }

  // getPedido(id: number): Observable<Pedido> {
  //   return from(
  //     axios.get(`${this.url}/pedidos/${id}`, this.getConfig())
  //       .then(response => response.data.data)
  //   );
  // }

  async getSucursales(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = await axios.get(this.url + '/sucursales?populate=*', { headers: options });
    return res.data.data;
  }

  async getPersonal(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = await axios.get(this.url + '/users?populate=sucursal', { headers: options });
    return res.data;
  }

  //   logout(){
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');
  //   this.currentUserSubject.next(null);
  // }

  createPedido(pedido: Partial<Pedido>): Observable<Pedido> {
    return from(
      axios.post(`${this.url}/pedidos`, { data: pedido }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return from(
      axios.put(`${this.url}/pedidos/${id}`, { data: pedido }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  // Categorías y Servicios
  getCategorias(token: string) {
    console.log('este es el token', token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = axios.get(this.url + '/categorias-prendas', { headers: options })
    return res
  }

  getServicios(token: string) {
    console.log('este es el token', token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = axios.get(this.url + '/servicios', { headers: options })
    return res
  }
  registrarEntrada(token: string, id: any, data: any) {
    console.log('este es el token', token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.put(this.url + '/inventarios/' + id, { data }, { headers: options })
  }

  registrarSalida(token: string, id: any, data: any) {
    console.log('este es el token', token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.put(this.url + '/inventarios/' + id, { data }, { headers: options })
  }

getInventario(token: string) {
  let options = new AxiosHeaders({
    'Authorization': 'Bearer ' + token
  });
  // Usa paginación con un límite alto (ej. 1000)
  const res = axios.get(this.url + '/inventarios?pagination[pageSize]=1000&populate=*', { headers: options });
  return res;
}
  
   getUsers(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = axios.get(this.url + '/users?populate=*', { headers: options });
    return res
  }
  
  postProductos(token: string, data: any) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/inventarios', { data }, { headers: options });
  }
  getRoles(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = axios.get(this.url + '/users-permissions/roles', { headers: options });
    return res
  }

  async postUser(data: any, token: string) {
    const options = new AxiosHeaders({
      'Authorization': `Bearer ${token}`
    });

    try {

      const registerResponse = await axios.post(
        `${this.url}/auth/local/register`,
        {
          username: data.username,
          email: data.email,
          password: data.password
        },
        { headers: options }
      );

      const userId = registerResponse.data.user.id; 
      const documentId = registerResponse.data.user.documentId;
      console.log('estos son los datos para logar ', data.sucursal, documentId)

      await axios.put( `${this.url}/sucursales/${data.sucursal}`, {data:{ users: documentId}}, { headers: options })
      console.log('este es el id del usuario', userId)
  
      const updateResponse = await axios.put(
        `${this.url}/users/${userId}`,
        {
          role: data.role
        },
        { headers: options }
      );

      return updateResponse.data; // Devuelve el usuario actualizado

    } catch (error) {
      console.error('Error en el proceso:', error);
      throw error; // Propaga el error para manejo externo
    }
  }

// Ejemplo de cómo debería ser tu servicio
putEstado(pedido: any, nuevoEstado: string, token: string){
  return axios.put(`${this.url}/pedidos/${pedido.documentId}`, {data:{estado: nuevoEstado}}, {
    headers: new AxiosHeaders({
      'Authorization': `Bearer ${token}`
    })
  });
}

  postPediodos(token: string, data: any) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/pedidos', { data }, { headers: options });
  }
  postPrendas(token: string, data: any) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/prendas-pedidos', { data }, { headers: options });
  }

  // En tu api.service.ts
  async obtenerUltimoNumeroPedido(token: string) {
    try {
      const response = await axios.get(`${this.url}/pedidos`, {
        params: {
          sort: 'numero_pedido:desc',
          pagination: {
            limit: 1
          },
          fields: ['numero_pedido']
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.data[0]?.numero_pedido || 0;

    } catch (error) {
      console.log(error)
    }
  }

  getResumenInventario(sucursalId?: number): Observable<ResumenInventario[]> {
    let url = `${this.url}/inventario/resumen`;
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
      axios.post(`${this.url}/inventario`, { data: movimiento }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  getSucursal(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = axios.get(`${this.url}/sucursales`, { headers: options })
    return res
  }

  createSucursal(sucursal: Partial<Sucursal>): Observable<Sucursal> {
    return from(
      axios.post(`${this.url}/sucursales`, { data: sucursal }, this.getConfig())
        .then(response => response.data.data)
    );
  }

  updateSucursal(documentId: any, data: any, token: string) {
    console.log(data)
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(`${this.url}/sucursales/${documentId}`, { data: data }, { headers: options });
  }
}