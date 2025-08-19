import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ItemInventario, ResumenInventario } from '../../models/inventario.model';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/services/api.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: false
})
export class InventarioPage implements OnInit {
  currentUser: any;
  selectedSegment = 'resumen';
  selectedSucursal: number = 0;
  sucursales: any[] = [];
  currentSucursalName: string = '';
  resumenInventario: any[] = [];

  showAddModal = false;
  showMovimientoModal = false;

  nuevoProducto = {
    producto: '',
    cantidad: 0,
    observaciones: '',
    sucursal:[]
  };

  movimientoData = {
    producto: '',
    tipo_movimiento: 'entrada' as 'entrada' | 'salida',
    cantidad: 0,
    observaciones: '',
    sucursal: '',
    id: ''
  };

  constructor(
    private authService: AuthService,
    private storage: Storage, private api: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) { }

  async ngOnInit() {
    // this.loadUserData();
    // this.loadSucursales();


    await this.storage.create();
    await this.getToken();
    await this.loadSucursales();
    

    // Obtén el token y el usuario guardados
    const tokenData = await this.storage.get('token');
    console.log('este es mis datos del token', tokenData)
    this.usuario = tokenData.user
    if (tokenData?.token && tokenData?.user) {
      this.currentUser = tokenData.user;
      console.log('este es el usuario', this.usuario)


    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }
    await this.loadResumenInventario();
    console.log(this.currentUser)

  }

  usuario: any;
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
  loadSucursales() {
    this.api.getSucursales(this.token).then((res) => {
      this.sucursales = res;
      console.log('sucursales totales', this.sucursales)
    }).catch((error) => {
      console.log(error)
    })
  }

async loadResumenInventario() {
  await this.api.getInventario(this.token).then((res) => {
    const allInventario = res.data.data;
    console.log(allInventario)

    let filteredInventario = [...allInventario];

    // Filtrado idéntico al ejemplo de pedidos
    if (this.currentUser?.role.name === 'empleado' && this.currentUser.sucursal) {
      filteredInventario = filteredInventario.filter(
        item => item.sucursal?.documentId === this.currentUser?.sucursal?.documentId
      );
      console.log(filteredInventario)
    } else if ((this.currentUser?.role.name === 'admin' || this.currentUser?.role.name === 'central') && this.selectedSucursal) {
      filteredInventario = filteredInventario.filter(
        item => item.sucursal?.documentId === this.selectedSucursal
      );
    }

    this.resumenInventario = filteredInventario;
    console.log('Inventario filtrado:', this.resumenInventario);

  }).catch((error) => {
    console.log(error);
  });
}

onSucursalChange() {
  this.loadResumenInventario();
}



  segmentChanged() {
    if (this.selectedSegment === 'resumen') {
      this.loadResumenInventario();
    } else {

    }
  }

  openMovimientoModal(item: any, tipo: 'entrada' | 'salida') {
    console.log('este es el producto', item)
    this.movimientoData = {
      producto: item.producto,
      tipo_movimiento: tipo,
      cantidad: item.cantidad,
      observaciones: item.observaciones,
      sucursal: item.sucursal?.documentId,
      id: item.documentId
    };
    this.showMovimientoModal = true;
  }

  agregarProducto() {
    if (this.nuevoProducto.producto && this.nuevoProducto.cantidad > 0) {
      console.log('Agregando producto:', this.nuevoProducto);

      const data ={ 
        producto: this.nuevoProducto.producto,
        cantidad: this.nuevoProducto.cantidad,
        observaciones: this.nuevoProducto.observaciones,
        fecha:  new Date().toISOString(),
        sucursal:[]
      }
      console.log('estos son los datos',data)
      this.api.postProductos(this.token, data).then((res)=>{
         this.mostrarAlerta('sucess', 'Se guardo el producto');
         this.loadResumenInventario()
      }).catch((error)=>{
        console.log(error)
      })
      // Resetear formulario
      this.nuevoProducto = {
        producto: '',
        cantidad: 0,
        observaciones: '',
        sucursal:[]
      };

      this.showAddModal = false;
    }
  }  

async registrarMovimiento() {
   try {
    // Preparar datos para la API
    const id =this.movimientoData.id;
    const data = {
      
      cantidad: this.movimientoData.cantidad,
      tipo_movimiento: this.movimientoData.tipo_movimiento.charAt(0).toUpperCase() + this.movimientoData.tipo_movimiento.slice(1),
      observaciones: this.movimientoData.observaciones || ''
    };
    console.log('estos datos se mandan', data)

    // Determinar qué endpoint usar según el tipo de movimiento
    let apiResponse;
    if (this.movimientoData.tipo_movimiento === 'entrada') {
      apiResponse = await this.api.registrarEntrada(this.token, id,  data);
    } else {
      apiResponse = await this.api.registrarSalida(this.token, id,  data);
    }

    // Verificar respuesta - FORMA CORRECTA PARA AXIOS
    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      console.log('Inventario actualizado correctamente');

      // Cerrar modal y resetear formulario
      this.showMovimientoModal = false;
      await this.loadResumenInventario();
      
    } else {
      console.error('Error al actualizar inventario:', apiResponse.statusText);
      // Mostrar error al usuario
    }
    
    
  } catch (error) {
    console.error('Error en registrarMovimiento:', error);
    // Mostrar error genérico al usuario
  }
  }




  getEmptyState(): any {
    if (this.selectedSegment === 'resumen') {
      return this.resumenInventario.length === 0;
    } else {
    }
  }

  getEmptyMessage(): string {
    if (this.selectedSegment === 'resumen') {
      return 'No hay productos en el inventario';
    } else {
      return 'No hay movimientos registrados';
    }
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