import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { Model } from 'src/app/Interfaces/Model.Interface';
import { OpenRouterService } from 'src/app/services/open-router.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfigUrlService } from 'src/app/services/config-url.service';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { SweetAlertComponent } from 'src/app/shared/component/sweet-alert/sweet-alert.component';

@Component({
  selector: 'app-agregar-editar-modelos',
  standalone: true,
  templateUrl: './agregar-editar-modelos.component.html',
  styleUrls: ['./agregar-editar-modelos.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    DropdownModule,
    FormsModule,
    RadioButtonModule,
    PanelModule,
    TooltipModule,
  ],
})
export class AgregarEditarModelosComponent implements OnInit{
  private readonly service = inject(OpenRouterService);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly serviceUrl = inject(ConfigUrlService);
  public id:string|null;
  public   encabezado:string='Crear';
  private readonly sweetalert: SweetAlertComponent = new SweetAlertComponent();

  form: FormGroup = this._formBuilder.group({
    name: ['', [Validators.required]],
    payMode: [''],
    idModelType:[''],
    idModel: [''],
    idModelOpenRouter: ['', [Validators.required]],
    idModelOpenAi: [''],
    description: ['', [Validators.required, Validators.minLength(10)]],

  });

  idModelOpenRouter;
  openRouterModelList=[];
  openRouterModelFilteredList=[];

  payMode: string;
  idModelType: string;

  showErrorLabels: boolean = false;

  openRouterIdentificator: string;
  openAiIdentificator: string;

  //TOOLTIP MESSAGES
  nameTooltip: string;
  openRouterTooltip: string;
  openRouterModelTooltip: string;
  openAiTooltip: string;
  openAiModelTooltip: string;
  descriptionTooltip: string;

  constructor(
    private readonly aroute :ActivatedRoute
  ){
    this.payMode = 'all';

    this.openRouterIdentificator = 'openRouter';
    this.openAiIdentificator = 'openAi';

    this.idModelType = this.openRouterIdentificator;

    this.id= this.aroute.snapshot.paramMap.get('id');
    this.form.get('idModelOpenAi')?.disable();

    //TOOLTIP MESSAGES
    this.nameTooltip = 'En este campo debe ingresar un nombre para el modelo.';
    this.openRouterTooltip = 'Seleccione esta opción, si desea crear un modelo de OpenRouter. '+
    'Para seleccionar, puede filtrar los modelos de acuerdo a las opciones presentadas.';
    this.openRouterModelTooltip = 'Seleccione el modelo a crear. Puede filtrar los modelos de OpenRouter de acuerdo a las opciones mostradas.';
    this.openAiTooltip = 'Seleccione esta opción, si desea crear un modelo de OpenAI.';
    this.openAiModelTooltip = 'Debe ingresar el Id del modelo de OpenAI.';
    this.descriptionTooltip = 'Ingrese una descripción para el modelo.';

  }

  ngOnInit(): void {
    this.getOpenRouterModels();
  }

  /**
   * Method to get openRouter models
   */
  getOpenRouterModels(){
    this.serviceUrl.getUrl().subscribe((response: any)=>{
      if(response){
        const url = response[0].url;
        this.service.getOpenRouterModels(url).subscribe((response: any)=>{
          if(response.data){
            this.openRouterModelList = response.data;
            this.onPayModeChange();

            if(this.id!=null){
              this.encabezado='Editar';
              this.getModel();
            }
          }
        });
      }
    });

  }

  onPayModeChange(){
    if(this.payMode === 'free'){
      this.openRouterModelFilteredList = this.openRouterModelList.filter(model =>
        Object.values(model.pricing).every(value => value === "0")
      );
    }
    if(this.payMode === 'pay'){
      this.openRouterModelFilteredList = this.openRouterModelList.filter(model =>
        Object.values(model.pricing)
          .map(value => Number(value))
          .some(value => value > 0)
      );
    }
    if(this.payMode === 'all'){
      this.openRouterModelFilteredList = this.openRouterModelList;
    }
  }

  /**
   * Method to create or edit model
   */
  public createEditModel():void{
    if(!this.form.invalid){
      this.showErrorLabels = false;

      let pricingType = '';
      if(this.idModelType === this.openRouterIdentificator){
        const isFree = this.idModelOpenRouter?.pricing
          && Object.values(this.idModelOpenRouter.pricing).every(value => value === "0");

        if(isFree){
          pricingType = 'free';
        }else{
          pricingType = 'payment';
        }
      }else{
        pricingType = 'payment';
      }

      const formModelo: Model = {
        name: this.form.value.name ?? '',
        description: this.form.value.description ?? '',
        idModel : this.idModelType===this.openRouterIdentificator? this.form.value.idModelOpenRouter.id : this.form.value.idModelOpenAi,
        idOrigin: this.idModelType,
        pricingType: pricingType,
        editable: true,
        complete : true
      };

     if(this.id!=null){
          this.editModel(this.id,formModelo);
     }else{
      this.addModel();
     }

    }else{
      this.showErrorLabels = true;
      this.sweetalert.sweetError('Error','Llene todos los campos requeridos.');
    }
  }

  /**
   * Method to get model to edit
   */
  public getModel():void{
    this.service.getModel(this.id).subscribe(data=>{
      if(data){
        let openRouterModel;
        if(data.idOrigin === this.openRouterIdentificator){
          this.idModelType = this.openRouterIdentificator;
          openRouterModel = this.openRouterModelList.find(model => model.id === data.idModel);

          this.form.get('idModelOpenAi')?.disable();
        }
        if(data.idOrigin === this.openAiIdentificator){
          this.idModelType = this.openAiIdentificator;

          this.form.get('idModelOpenAi')?.enable();
          this.form.get('payMode')?.disable();
          this.form.get('idModelOpenRouter')?.disable();
        }

        this.form.patchValue({
          name:data.name,
          idModelOpenRouter:data.idOrigin === this.openRouterIdentificator? openRouterModel : null,
          idModelOpenAi:data.idOrigin === this.openAiIdentificator? data.idModel : null,
          description:data.description,
        })

      }else{
        this.sweetalert.sweetError('Error','No se pudo obtener la información del modelo.');
      }
    });
  }

  /**
   * Method to create model
   * @returns
   */
  addModel() {
    if (this.form.invalid) {
      this.sweetalert.sweetError('Error',"Llene todos los campos requeridos.")
      return;
    }

    let pricingType = '';
    if(this.idModelType === this.openRouterIdentificator){
      const isFree = this.idModelOpenRouter?.pricing
        && Object.values(this.idModelOpenRouter.pricing).every(value => value === "0");

      if(isFree){
        pricingType = 'free';
      }else{
        pricingType = 'payment';
      }
    }else{
      pricingType = 'payment';
    }

    const formData: Model = {
      name: this.form.value.name ?? '',
      description: this.form.value.description ?? '',
      idModel: this.idModelType===this.openRouterIdentificator? this.form.value.idModelOpenRouter.id : this.form.value.idModelOpenAi,
      idOrigin: this.idModelType,
      pricingType: pricingType,
      editable: true,
      complete : true
    };
    this.service.AddModels(formData).subscribe({
      next: (response) => {
        this.sweetalert.sweetCorrecto('Registro ','Modelo guardado correctamente');
        this.router.navigate(['/modelsList']);
      },
      error: (err) => {
        this.sweetalert.sweetError('Error',"Existio un error en la petición")
      }
    });
  }

  /**
   * Method to edit model
   * @param id
   * @param ppc
   */
  public editModel(id:string, ppc: Model):void{
    this.service.UpdateModel(id,ppc).subscribe({
    next:(response)=>{
      this.sweetalert.sweetCorrecto('Registro ','¡Modelo editado correctamente!');
      this.router.navigate(['/modelsList']);
    },error :(error)=>{
      this.sweetalert.sweetError('Error',error.error.detail)
    }
    })

  }

  /**
   * To change validations on select
   * origin model type
   */
  onSelectModelOriginType(){

    if(this.idModelType === this.openRouterIdentificator){

      this.form.get('idModelOpenAi')?.disable();
      this.form.get('payMode')?.enable();
      this.form.get('idModelOpenRouter')?.enable();
      this.form.patchValue({
        idModelOpenAi: null
      });

      this.form.get('idModelOpenRouter')?.setValidators([Validators.required]);
      this.form.get('idModelOpenAi')?.setValidators(null);
      this.form.get('idModelOpenRouter')?.updateValueAndValidity();
      this.form.get('idModelOpenAi')?.updateValueAndValidity();
    }

    if(this.idModelType === this.openAiIdentificator){
      this.form.get('idModelOpenAi')?.enable();

      this.form.get('payMode')?.disable();
      this.form.get('idModelOpenRouter')?.disable();
      this.payMode = 'all';

      this.form.patchValue({
        idModelOpenRouter: null,
      });

      this.form.get('idModelOpenRouter')?.setValidators(null);
      this.form.get('idModelOpenAi')?.setValidators([Validators.required]);
      this.form.get('idModelOpenRouter')?.updateValueAndValidity();
      this.form.get('idModelOpenAi')?.updateValueAndValidity();
    }
  }
}
