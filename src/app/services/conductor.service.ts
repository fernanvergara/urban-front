// src/app/services/conductor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments'; 

// Interfaz para el modelo de Conductor (ajusta según tu backend)
export interface Conductor {
  id?: number; // Opcional para nuevos conductores
  nombreCompleto: string;
  identificacion: string;
  fechaNacimiento: string; // (ej. "15/05/1985")
  telefono: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConductorService {
  private apiUrl = `${environment.API_BASE_URL}/v1/conductores`; // Ajusta según tu base URL

  constructor(private http: HttpClient) { }

  // Helper para obtener los encabezados de autorización
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken'); // O donde almacenes tu token JWT
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los conductores
  obtenerTodosLosConductores(): Observable<Conductor[]> {
    return this.http.get<Conductor[]>(`${this.apiUrl}/todos`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener conductor por ID
  obtenerConductorPorId(id: number): Observable<Conductor> {
    return this.http.get<Conductor>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener conductor por Identificación 
  obtenerConductorPorIdentificacion(identificacion: string): Observable<Conductor> {
    return this.http.get<Conductor>(`${this.apiUrl}/${identificacion}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear un nuevo conductor
  crearConductor(conductor: Conductor): Observable<Conductor> {
    // Elimina el ID si está presente, ya que es una creación
    const { id, ...conductorSinId } = conductor;
    return this.http.post<Conductor>(this.apiUrl, conductorSinId, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar un conductor existente
  actualizarConductor(id: number, conductor: Conductor): Observable<Conductor> {
    return this.http.put<Conductor>(`${this.apiUrl}/${id}`, conductor, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Inactivar/Activar un conductor (cambiar estado activo)
  cambiarEstadoActivoConductor(id: number, activo: boolean): Observable<Conductor> {
    const params = new HttpParams().set('activo', activo.toString());
    return this.http.patch<Conductor>(`${this.apiUrl}/${id}/estado`, null, { headers: this.getAuthHeaders(), params: params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
