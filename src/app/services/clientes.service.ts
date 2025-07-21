// src/app/services/clients.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Para obtener el token

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private API_BASE_URL = 'http://localhost:8080/api'; // Asegúrate de que esta URL sea correcta

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Obtener todos los clientes
  // Este endpoint requiere rol ADMIN en el backend
  getAllClientes(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) {
      // Manejar el caso donde no hay token, quizás lanzando un error o redirigiendo
      return new Observable(observer => {
        observer.error('No hay token de autenticación disponible.');
        this.authService.showMessage('No autenticado. Por favor, inicia sesión.', 'error');
      });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.API_BASE_URL}/v1/clientes/todos`, { headers });
  }
}
