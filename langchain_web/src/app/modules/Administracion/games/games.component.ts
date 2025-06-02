import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Game } from 'src/app/Interfaces/Game.interface';
import { GameService } from 'src/app/services/game.service';
import { SweetAlertComponent } from 'src/app/shared/component/sweet-alert/sweet-alert.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './games.component.html'
})
export class GamesComponent implements OnInit {
  private readonly service =inject(GameService);
  private readonly sweetalert: SweetAlertComponent = new SweetAlertComponent();

  juegos: Game[] = [];

  juegoForm: FormGroup;
  editIndex: number | null = null;
  private readonly fb = inject(FormBuilder);

  constructor() {}
  ngOnInit(): void {
      this.getGames();
  }


  deleteGame(index: string) {
        Swal.fire({
          title: "¿Eliminar Juego?",
          text: "¡Estás seguro de eliminar el Juego!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Eliminar"
        }).then((result) => {
          if (result.isConfirmed) {
            this.service.deleteGames(index).subscribe({
              next: (response: any) => {
                this.sweetalert.sweetCorrecto('Eliminado!',"Juego eliminado correctamente")
                  this.getGames();
              },
              error: (error) => {
                this.sweetalert.sweetError('Error',"No se pudo eliminar el Juego")
              }
            });
          }
        });
  }

    private getGames():void{
        this.service.getGames().subscribe(
          response => {
            if (response) {
              this.juegos = response;
            }
    })
    }
}
