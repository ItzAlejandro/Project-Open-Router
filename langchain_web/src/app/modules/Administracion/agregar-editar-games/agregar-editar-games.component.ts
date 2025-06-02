import { CommonModule } from '@angular/common';
import { Component, inject, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Game } from 'src/app/Interfaces/Game.interface';
import { GameService } from 'src/app/services/game.service';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { SweetAlertComponent } from 'src/app/shared/component/sweet-alert/sweet-alert.component';

@Component({
  selector: 'app-agregar-editar-games',
  standalone: true,
  templateUrl: './agregar-editar-games.component.html',
  styleUrls: ['./agregar-editar-games.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FileUploadModule,
    TooltipModule
  ],
})
export class AgregarEditarGamesComponent {
  private readonly sweetalert: SweetAlertComponent = new SweetAlertComponent();

  private readonly service = inject(GameService);
  private readonly router = inject(Router);
  private readonly _formBuilder= inject(FormBuilder);
  public id:string|null;
  public encabezado:string='Crear';

  uploadedFiles:any[] = [];
  fileContent: string = '';
  isNotSelectedFile:boolean=false;

  showErrorLabels: boolean = false;
  fileFormats: string;
  allowedFileFormats: string[] = [];

  gameForm: FormGroup = this._formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    players: [1, [Validators.required, Validators.min(1)]],
    rulesheet: ['', Validators.required],
    editable:[true],
  });

  //TOOLTIP MESSAGES
  nameTooltip: string;
  playerNumberTooltip: string;
  descriptionTooltip: string;
  gamerulesTooltip: string;

  constructor(
    private readonly aroute :ActivatedRoute
  ) {
    this.fileFormats = '.txt,.hrf,.json';
    this.allowedFileFormats = this.fileFormats.split(',');

    this.id= this.aroute.snapshot.paramMap.get('id');

    //TOOLTIP MESSAGES
    this.nameTooltip = 'En este campo debe ingresar un nombre para el juego.';
    this.playerNumberTooltip = 'En este campo debe ingresar la cantidad de jugadoores que va a tener el juego.';
    this.descriptionTooltip = 'En este campo debe ingresar la descripción del juego.';
    this.gamerulesTooltip = 'En este campo debe ingresar las reglas de juego. ' +
    'Puede ingresar las reglas manualmente o cargando un archivo en los formatos permitidos.';
  }

  ngOnInit(): void {
    if(this.id!=null){
      this.encabezado='Editar';
      this.getGame();
    }
  }

  /**
   * Method to create or edit games
   * @returns
   */
  public creatEditGame() : void{
    if(!this.gameForm.invalid){

      if(this.fileContent.trim() === ''){
        this.isNotSelectedFile = true;
      }else{
        this.gameForm.value.rulesheet = this.fileContent;
      }

      const formGame: Game = {
      name: this.gameForm.value.name ?? '',
      description: this.gameForm.value.description ?? '',
      players :this.gameForm.value.players ?? '',
      rulesheet : this.gameForm.value.rulesheet ?? '',
      editable: true
    };

      if(this.id!=null){
          this.edit(this.id,formGame);
      }else{
      this.addGame();
      }

    }else{
      this.showErrorLabels = true;
      if(this.fileContent.trim() === ''){
        this.isNotSelectedFile = true;
      }
      this.sweetalert.sweetError('Error','Llene todos los campos requeridos.')
    }
  }

 public addGame():void {
    if (this.gameForm.invalid) {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }

    const formData = this.gameForm.value;

    this.service.AddGames(formData).subscribe({
      next: (response) => {
        this.sweetalert.sweetError('Juego',' Guardado Correctamente.')
        this.router.navigate(['/gamesList']);
      },
      error: (err) => {
        this.sweetalert.sweetError('Error','Existio un Error en la Petición.')
      }
    });
  }

  /**
   * Method to edit game
   * @param id
   * @param game
   */
  public edit(id:string, game: Game):void{
    this.service.UpdateGame(id,game).subscribe({
      next:(response)=>{
        this.sweetalert.sweetError('Registro',' Editado Correctamente!')
          this.router.navigate(['/gamesList']);
    },error :(error)=>{
      this.sweetalert.sweetError('Error',error.error.detail)
    }
    })
  }

  public getGame():void{
    this.service.getGame(this.id).subscribe((data)=>{
        this.gameForm.patchValue({
          name:data.name,
          description:data.description,
          players:data.players,
          rulesheet: data.rulesheet
        })
    })
  }

  public limpiarFormulario(): void {
    this.gameForm.reset();
  }

  /**
   * Method to read selected file
   */
  onSelectFile(event: any){
    this.uploadedFiles = [];

    const file = event.files[0];
    const docType = `.${file.name.split('.').pop()}`;

    if(!this.allowedFileFormats.includes(docType)){
      this.fileContent = '';
      return;
    }

    if (file) {
      this.uploadedFiles.push(file);
      this.readFileContent(file);
    }
  }

  /**
   * Method to read file content
   * @param file
   */
  readFileContent(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      this.fileContent = reader.result as string; // Guardamos el contenido en una variable
      this.gameForm.patchValue({
        rulesheet: this.fileContent,
      });
      this.isNotSelectedFile=false;
    };

    reader.onerror = () => {
      this.sweetalert.sweetError('Error',"'Error al leer el archivo.")
      this.fileContent = '';
    };

    reader.readAsText(file); // Leemos el archivo como texto
  }

  /**
   * Method to delete selected file
   */
  onRemoveOtherFiles(event: any){
    this.fileContent = '';
    this.uploadedFiles = [];
  }

}
