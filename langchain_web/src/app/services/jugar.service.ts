import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GamePlay } from '../Interfaces/GamePlay.inteface';
import { Observable } from 'rxjs';
import { Response } from '../Interfaces/Response.interface';

@Injectable({
  providedIn: 'root'
})
export class JugarService {
 private readonly myAppUrl: string = environment.endpoint;
  constructor(private readonly http: HttpClient) {}

      public AddGame(juego: GamePlay): Observable<Response>  {
        const headers = new HttpHeaders({
          'accept': 'application/json',
          'Content-Type': 'application/json'
        });
        return this.http.post<Response>(`${this.myAppUrl}partidas`, juego, { headers });
      }
}
