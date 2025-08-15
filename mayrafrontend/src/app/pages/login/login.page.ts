import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../models/user.model';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  credentials: LoginCredentials = {
    correo: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private apilogin: AuthService,
    private router: Router,
    private storage: Storage,
    private alertController: AlertController
  ) {}

  ngOnInit(){
    
  }

  onLogin() {
    if (this.credentials.correo && this.credentials.password) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Simulación de autenticación (en producción conectar con Strapi)
      setTimeout(() => {
        this.simulateLogin();
      }, 1000);
    }
  }

  login(){
    if (!this.credentials.correo || !this.credentials.password) {
      this.presentAlert('Campos incompletos', 'Por favor, ingresa tu nombre de usuario y contraseña.');
      return; 
    }
    const data = {
      identifier:this.credentials.correo,
      password: this.credentials.password
    }

    this.apilogin.login(data).then( (res:any) =>{
        console.log(res);
        this.storage.set('token', res)
        this.router.navigateByUrl('/dashboard')
      }).catch((error)=>{
        console.log(error);
      })
  }

  private simulateLogin() {
    // Simulación de usuarios para demostración
    const users = [
      {
        correo: 'admin@lavanderia.com',
        password: 'admin123',
        user: {
          id: 1,
          nombre: 'Administrador',
          correo: 'admin@lavanderia.com',
          rol: 'admin' as const
        }
      },
      {
        correo: 'empleado@sucursal1.com',
        password: 'emp123',
        user: {
          id: 2,
          nombre: 'Juan Pérez',
          correo: 'empleado@sucursal1.com',
          rol: 'empleado' as const,
          sucursal: {
            id: 1,
            nombre: 'Sucursal Centro',
            direccion: 'Calle Principal 123'
          }
        }
      },
      {
        correo: 'central@lavanderia.com',
        password: 'central123',
        user: {
          id: 3,
          nombre: 'María García',
          correo: 'central@lavanderia.com',
          rol: 'central' as const
        }
      }
    ];

    const validUser = users.find(u => 
      u.correo === this.credentials.correo && 
      u.password === this.credentials.password
    );

    if (validUser) {
      // Simular respuesta de autenticación
      const authResponse = {
        jwt: 'fake-jwt-token',
        user: validUser.user
      };
      
      localStorage.setItem('token', authResponse.jwt);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Credenciales incorrectas';
    }
    
    this.isLoading = false;
  }
    async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}