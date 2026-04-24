import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { Integrante } from './integrante';

@Injectable({
  providedIn: 'root',
})
export class IntegranteService {
  private readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}/integrantes`;

  listarIntegrantes(): Observable<Integrante[]> {
    return this.http.get<Integrante[]>(this.apiUrl);
  }

  guardarIntegrante(integrante: Integrante): Observable<Integrante | null> {
    return this.http.post<Integrante | null>(this.apiUrl, integrante);
  }
}
