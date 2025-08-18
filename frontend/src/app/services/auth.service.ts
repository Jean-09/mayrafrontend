import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { User, LoginCredentials, AuthResponse } from '../models/user.model';
import axios, {AxiosHeaders} from 'axios';
import { environment } from 'src/environments/environment.prod';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = environment.urlapi;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject;

  constructor(private storage: Storage) {
    this.loadUserFromStorage();
    this.storage.create()
  }

  async login(data: any) {

    console.log(data)
    const res = await axios.post(this.url + '/auth/local', data);
    const { jwt, user } = res.data;

    const userRes = await axios.get(this.url + '/users/me?populate=*', {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    return {
      token: jwt,
      user: userRes.data
    };
  //   return from(
  //     axios.post<AuthResponse>(`${this.url}/auth/local`, {
  //       identifier: credentials.correo,
  //       password: credentials.password
  //     }).then(response => {
  //       this.setSession(response.data);
  //       return response.data;
  //     })
  //   );
  }

 

  getUser(){
    // return this.currentUser;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.rol === role : false;
  }

  canAccessSucursal(sucursalId: number): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    if (user.rol === 'admin' || user.rol === 'central') return true;
    return user.sucursal?.id === sucursalId;
  }

  private setSession(authResponse: AuthResponse){
    localStorage.setItem('token', authResponse.jwt);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
  }

  private loadUserFromStorage(){
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }
}