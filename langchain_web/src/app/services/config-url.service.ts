import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigUrlService {
 private readonly myAppUrl: string = environment.endpoint;
 private readonly http = inject(HttpClient);
  constructor() {}

      public getUrl() :Observable<any>{
        const headers = new HttpHeaders({
          'accept': 'application/json',
          'Content-Type': 'application/json'
        });

        return this.http.get<any>(`${this.myAppUrl}url`, { headers });
      }

      public UpdateUrl(id:string, url: string) :Observable<Response>{
        const headers = new HttpHeaders({
          'accept': 'application/json',
          'Content-Type': 'application/json'
        });
        const body = { url };
        return this.http.put<Response>(`${this.myAppUrl}url/${id}`, body, { headers });
      }
}
