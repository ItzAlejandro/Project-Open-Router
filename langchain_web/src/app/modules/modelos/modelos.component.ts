import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';


import { OpenRouterService } from 'src/app/services/open-router.service';
import { SweetAlertComponent } from 'src/app/shared/component/sweet-alert/sweet-alert.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './modelos.component.html'
})
export class ModelosComponent  implements OnInit {
      private readonly sweetalert: SweetAlertComponent = new SweetAlertComponent();

  private readonly _service = inject(OpenRouterService);
  public get service() {
    return this._service;
  }
  modelsList=[];

  originsList: any[] = [];
  modelTypeList: any[] = [];

  ngOnInit(): void {

    this.originsList = [
      {
        'id':'openRouter',
        'name':'OpenRouter'
      },
      {
        'id':'openAi',
        'name':'OpenAI'
      }
    ];

    this.modelTypeList = [
      {
        'id':'free',
        'name':'Gratis'
      },
      {
        'id':'payment',
        'name':'De paga'
      }
    ];

    this.getModelList();
  }

  /**
   * Method to get model list
   */
  public getModelList():void{
    this.service.getModels().subscribe((response:any) =>{
      if(response){
        this.modelsList = response;
      }
    });
  }

    /**
     * Method to delete model
     * @param id
     */
   public deleteModel(id: string):void{
    Swal.fire({
      title: "¿Eliminar Modelo?",
      text: "¡Estás seguro de eliminar el modelo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteModels(id).subscribe({
          next: (response: any) => {
            this.sweetalert.sweetCorrecto('Eliminado!',"Modelo eliminado correctamente");
              this.getModelList();
          },
          error: (error) => {
            this.sweetalert.sweetError('Error',"No se pudo eliminar el modelo");
          }
        });
      }
    });
  }

  /**
   * Method to set origin name
   * @param idOrigin
   * @returns
   */
  setOriginName(idOrigin: string){
    let originName = this.originsList.find(x=> x.id === idOrigin);
    return originName.name;
  }

  /**
   * Method to set model type name
   * @param pricingType
   * @returns
   */
  setModelType(pricingType: string){
    let typeName = this.modelTypeList.find(x=> x.id === pricingType);
    return typeName.name;
  }

}
