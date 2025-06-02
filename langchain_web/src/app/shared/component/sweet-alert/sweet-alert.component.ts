import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sweet-alert',
  standalone: true,
  imports: [],
  templateUrl: './sweet-alert.component.html'
})
export class SweetAlertComponent {
  sweetCorrecto(titulo:string,mensaje :string):void{
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: "success"
    });
  }
  sweetError(titulo:string,mensaje :string):void{
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: "error"
    });
  }
}
