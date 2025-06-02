import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Game } from '../Interfaces/Game.interface';
import { Response, ResponseUnique } from '../Interfaces/Response.interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {
 private readonly myAppUrl: string = environment.endpoint;
 private readonly http = inject(HttpClient);

 public socket!: WebSocket;
 private url: string = 'ws://localhost:8000/ws/partidas';
  constructor() { }

   public getGames() :Observable<Game[]>{
            const headers = new HttpHeaders({
              'accept': 'application/json',
              'Content-Type': 'application/json'
            });
            return this.http.get<Game[]>(`${this.myAppUrl}game`, { headers });
          }

    public getGame(id : string): Observable<Game> {
        const headers = new HttpHeaders({
        'accept': 'application/json'
        });

        return this.http.get<Game>(`${this.myAppUrl }game/${id}`, { headers });
    }

    public AddGames(game: Game) {
      const headers = new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json'
      });
      return this.http.post(`${this.myAppUrl}game`, game, { headers });
    }

    public UpdateGame(id:string, game: Game) :Observable<Response>{
      const headers = new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json'
      });
      return this.http.put<Response>(`${this.myAppUrl}game/${id}`, game, { headers });
    }

  public deleteGames(id:string){
    const headers = new HttpHeaders({
      'accept': 'application/json'
    });
      return this.http.delete(`${this.myAppUrl }game/${id}`, { headers });
  }

  public getAct() :Observable<ResponseUnique>{
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.get<ResponseUnique>(`${this.myAppUrl}act`);
  }
  public DownloadReport(id:string) {
    return this.http.get(`${this.myAppUrl}reporte/${id}`, {
      responseType: 'blob'
    });
  }


//CONFIGURAR WEB SOCKET

  connect(): void {

    this.socket = new WebSocket("wss://caymaneventos.com/ws/partidas");

    this.socket.onopen = () => {
      console.log('Conectado al WebSocket');
    };
    this.socket.onmessage = (event) => {
      console.log("Mensaje enviado desde el backend", event.data);
    }

    this.socket.onclose = () => {
      console.log('Desconectado del WebSocket');
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };
  };


// Método para cerrar la conexión
close(): void {
  if (this.socket) {
    this.socket.close();
  }
}
}
