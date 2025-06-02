import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Model } from '../Interfaces/Model.Interface';
import { Response } from '../Interfaces/Response.interface';

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {

    private readonly myAppUrl: string = environment.endpoint;
    private readonly UrlgetAllModelsOpenRouter : string = 'api/v1/models';

    constructor(private readonly http: HttpClient) {}

    getModels(): Observable<any> {
        const headers = new HttpHeaders({
        'accept': 'application/json'
        });

        return this.http.get<any>(`${this.myAppUrl }model`, { headers });
    }

    getOpenRouterModels(url:string): Observable<any> {
        const headers = new HttpHeaders({
        'accept': 'application/json'
        });

        return this.http.get<any>(url, { headers });
    }


    getModel(id : string): Observable<Model> {
      const headers = new HttpHeaders({
      'accept': 'application/json'
      });

      return this.http.get<Model>(`${this.myAppUrl }model/${id}`, { headers });
  }


    public deleteModels(id:string){
      const headers = new HttpHeaders({
        'accept': 'application/json'
        });

        return this.http.delete(`${this.myAppUrl }model/${id}`, { headers });
    }


    public AddModels(model: Model) {
      const headers = new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json'
      });

      model.complete = true;

      return this.http.post(`${this.myAppUrl}model`, model, { headers });
    }


    public UpdateModel(id:string, model: Model) :Observable<Response>{
      const headers = new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json'
      });
      model.complete = true;
      return this.http.put<Response>(`${this.myAppUrl}model/${id}`, model, { headers });
    }

    public validateApiKey(apiKey:string){
      const headers = new HttpHeaders({
        'accept': 'application/json'
        });

        return this.http.get(`${this.myAppUrl}apiKey/${apiKey}`, { headers, observe: 'response' })
        .pipe(
          map(response => {
            if (response.status === 200) {
              return { success: true, data: response.body };
            }
            return { success: false, message: 'Unexpected status' };
          }),
          catchError((error: HttpErrorResponse) => {
            return throwError(() => new Error(`${error.error.detail}`));
          })
        );
    }
}

