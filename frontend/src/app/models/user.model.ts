export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'empleado' | 'central';
  sucursal?: Sucursal;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}