import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { GamePlay } from 'src/app/Interfaces/GamePlay.inteface';
import { JugarService } from 'src/app/services/jugar.service';
import { OpenRouterService } from 'src/app/services/open-router.service';
import { GameService } from 'src/app/services/game.service';
import { Game } from 'src/app/Interfaces/Game.interface';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import _ from 'lodash';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { Model } from 'src/app/Interfaces/Model.Interface';
import { SweetAlertComponent } from 'src/app/shared/component/sweet-alert/sweet-alert.component';

@Component({
  selector: 'app-game-component',
  templateUrl: './game-component.component.html',
  styleUrls: ['./game-component.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    TooltipModule,
    PanelModule,
  ]
})
export class GameComponentComponent implements OnInit {

  private readonly openRouterServices = inject(OpenRouterService);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(JugarService);
  private readonly gameService = inject(GameService);
  private  IdPartida : string | null;
  private readonly sweet= new SweetAlertComponent();
  model1: Model;
  model2: Model;
  modelsList=[];
  gameList:Game[];
  selectedGame:Game;
  juegoForm: FormGroup;
  isTwoGamers: boolean = false;
  gameType: string = 'single';
  validApiKey:boolean = false;
  receivedMessage: string = '';
  private apiKeyContent:string ="";
  private webSocketSubscription: any;
  logs: string[] = [];
  partidas: any[] = [];
  openRouterDefaultApiKey: string = '';
  needOpenRouterApiKey: boolean ;
  needOpenAiApiKey: boolean;

  openRouterIdentificator: string;
  openAiIdentificator: string;

  showDownloadButton: boolean;

  //TOOLTIP MESSAGES
  selectGameTooltip: string;
  promptTooltip: string;
  openRouterApiTooltip: string;
  openAiApiTooltip: string;
  modelTooltip: string;
  gameTypeTooltip: string;
  numberGamesTooltip: string;
  codeNew : string;
  constructor() {
    this.getModels();
    this.getGames();

    this.needOpenRouterApiKey = false;
    this.needOpenAiApiKey = false;

    this.showDownloadButton = false;

    this.openRouterIdentificator = 'openRouter';
    this.openAiIdentificator = 'openAi';
    //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
    //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
    this.openRouterDefaultApiKey ='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';

    //TOOLTIP MESSAGES
    this.selectGameTooltip = 'Seleccione un juego. Puede crear un juego nuevo desde la ventana \'Juegos\'.';
    this.promptTooltip = 'Se agregarán las instrucciones del juego seleccionado y se podrán editar.';
    this.openRouterApiTooltip = 'Se debe ingresar una Api key de OpenRouter ya que seleccionó un modelo \'De paga\'.';
    this.openAiApiTooltip = 'Se debe ingresar una Api key de OpenAI ya que seleccionó un modelo de Open AI.';
    this.modelTooltip = 'Seleccione un modelo disponible. Puede crear un modelo desde la ventana \'Modelos\'.';
    this.gameTypeTooltip = 'Seleccione el tipo de juego. Single se juega una vez Double se juega dos veces la primera vez inicia el modelo 1 y el la segunda vez inicia el modelo 2.';
    this.numberGamesTooltip = 'Seleccione el número de veces a jugar.';
  }

  ngOnInit(): void {
    this.setFormValidations();
    this.codeUnique();
  }


/**
 * Method to set validations
 */
setFormValidations(){
  this.juegoForm = this.fb.group({
    apiKey: [null],
    apiKeyOpenAi: [null],
    templateFile: [null],
    juego: ['', Validators.required],
    prompt: ['',Validators.required],
    model1: ['', Validators.required],
    model2: ['', null],
    gameType:[''],
    numberGames: [1, [Validators.required, Validators.min(1)]],
  })
}

/**
 * Method to submit form
 */
onSubmit(): void {
  if (this.juegoForm.valid) {
    this.showDownloadButton = false;
    const formData = this.juegoForm.value;

    if(!this.validApiKey && this.needOpenRouterApiKey){
      throw  this.sweet.sweetError('Error',"Ingrese o valide un API Key OpenRouter.")
    }

    if(!formData.apiKeyOpenAi && this.needOpenAiApiKey){
      throw  this.sweet.sweetError('Error',"Ingrese o un API Key OpenAI.")
    }
    if(formData.numberGames>5) throw  this.sweet.sweetError('Error',"Limite Maximo de partida es 5")
    const juego: GamePlay = {
      codeUnique : this.codeNew,
      apikey: this.needOpenRouterApiKey?this.apiKeyContent : this.openRouterDefaultApiKey,
      apiKeyOpenAi: formData.apiKeyOpenAi,
      ia1: formData.model1.idModel,
      ia2: formData.model2.idModel,
      juego: formData.juego.name,
      prompt: formData.prompt,
      fecha: new Date().toISOString(),
      gameType: this.gameType,
      numberGames: formData.numberGames
    };


    this.webSocket();
      this.service.AddGame(juego).subscribe({
          next:(res)=>{
            this.sweet.sweetCorrecto('OK',res.message)
            this.showDownloadButton = true;
            this.IdPartida=res.partida._id;
      },
          error:(err)=>{
            this.sweet.sweetError('Error',err.error.message)
        }
  });
  }
}
public webSocket(){
  this.gameService.connect();
  this.webSocketSubscription = this.gameService.socket.onmessage = (event => {
    const mensaje = JSON.parse(event.data);
    const log = this.formatMensaje(mensaje);
    if(log)this.logs.push(log);
  });
}

formatMensaje(mensaje: any): string {
  console.log("Nuevo mensaje",mensaje);
  const { idPartida, codeUnique, move, reason, result, model, player, is_winner } = mensaje;
  if (codeUnique !== this.codeNew)
    return null;
  if(reason =='Error en parseo de movimiento'||reason =='Error en parseo de movimiento directamente')
    return null;
  const ganadorTexto = ['true', true, 'SI', 'Si', 'si'].includes(is_winner) ? 'Sí' : 'No';
  return `> Jugada: ${move}\n> Razón: ${reason}\n> Modelo: ${model}\n> Jugador: ${player}\n> Ganador: ${ganadorTexto}`;
}


  getModels(){
    this.openRouterServices.getModels().subscribe((response:any) =>{
      if(response){
        this.modelsList = response;
      }
    });
  }

  editApiKey(){
    this.validApiKey = false;
    this.apiKeyContent ="";
    this.juegoForm.get('apiKey')?.enable();
    this.juegoForm.patchValue({
      apiKey: null
    });
  }

  validateApiKey(){
    const key = this.juegoForm.value.apiKey;
    this.apiKeyContent ="";
    if(_.isNil(key) || key.trim()===''){
      this.sweet.sweetError('Por favor',"Ingrese una API Key.")
      return;
    }
    this.openRouterServices.validateApiKey(key.trim()).subscribe({
      next: (res) => {
        this.juegoForm.get('apiKey')?.disable();
        this.validApiKey = true;
        this.apiKeyContent = key.trim();
        this.sweet.sweetCorrecto('API KEY'," Valida")
      },
        error: (err) => {
          this.validApiKey = false;
          this.apiKeyContent ="";
          this.juegoForm.get('apiKey')?.enable();
          this.sweet.sweetError('API KEY',"Invalida")
        }
      });
  }


  getGames(){
    this.gameService.getGames().subscribe((response:any)=>{
      if(response){
        this.gameList = response;
      }
    });
  }

  onSelectedGame(){
    this.juegoForm.patchValue({
      prompt: this.selectedGame.description + '\n' + this.selectedGame.rulesheet
    });

    if(this.selectedGame.players > 1){
      this.isTwoGamers = true;

      this.juegoForm.get('model2')?.setValidators(Validators.required);
      this.juegoForm.get('model2')?.updateValueAndValidity();
    }else{
      this.isTwoGamers = false;
    }
  }


  verifyModelChange(){
    let modelList: Model[] = [];
    if (this.model1) {
      modelList.push(this.model1);
    }
    if (this.model2) {
      modelList.push(this.model2);
    }

    const needOpenRouterApi = modelList.some(
      model => model.idOrigin === 'openRouter' && model.pricingType === 'payment');
    const needOpenAiApi = modelList.some(
      model => model.idOrigin === 'openAi' && model.pricingType === 'payment');

    if(needOpenRouterApi){
      this.needOpenRouterApiKey = true;
    }else{
      this.needOpenRouterApiKey = false;
    }

    if(needOpenAiApi){
      this.needOpenAiApiKey = true;
    }else{
      this.needOpenAiApiKey = false;
    }
  }

  codeUnique(){
    this.gameService.getAct().subscribe((response)=>{
      if(response.success){
        this.codeNew = response.model;
      }
    });
  }
    //Descargar Excel
    public DowloadReport() : void{
        if(!this.IdPartida) throw  this.sweet.sweetError('Existio un Error',"No se puede descargar el Reporte.")
        this.gameService.DownloadReport(this.IdPartida).subscribe({
          next: (res) => {
            const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_partida_${this.IdPartida}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            this.sweet.sweetCorrecto('Correcto',"Reporte Descargado Correctamente")
          },
            error: (err) => {
              this.sweet.sweetError('Existio un Error',err.err.message)
            }
        })
    }
    limpiarPantalla():void{
      this.juegoForm.reset();
      this.codeUnique();
      this.showDownloadButton = false;
      this.logs=[];
    }
}
