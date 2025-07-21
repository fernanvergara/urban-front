// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importar Router
import { environment } from '../../environments/environments'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Subject para emitir mensajes globales a la aplicación
  private messageSubject = new BehaviorSubject<{ message: string | null, type: 'success' | 'error' | 'info' }>({ message: null, type: 'info' });
  message$ = this.messageSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { } // Inyectar Router

  // Método para mostrar mensajes
  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.messageSubject.next({ message, type });
  }

  // Nuevo método para decodificar el JWT y extraer su payload
  private decodeJwt(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }

  // Login de usuario
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${environment.API_BASE_URL}/v1/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.jwtToken) {
            localStorage.setItem(environment.TOKEN_KEY, response.jwtToken); // Usar clave consistente
            localStorage.setItem(environment.USERNAME_KEY, credentials.username);
            // Decodificar el JWT para obtener los claims, incluyendo los roles
            const decodedToken = this.decodeJwt(response.jwtToken);
            if (decodedToken && decodedToken.roles && decodedToken.roles.length > 0) {
              const roleWithoutPrefix = decodedToken.roles[0].replace('ROLE_', '');
              localStorage.setItem(environment.ROLE_KEY, roleWithoutPrefix);
            } else {
              console.warn("El rol no se encontró en el token JWT o está vacío.");
              localStorage.removeItem(environment.ROLE_KEY);
            }
            this.showMessage('¡Inicio de sesión exitoso!', 'success');
          }
        }),   
        catchError(this.handleError)
      );
  }

  // Registro de usuario
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${environment.API_BASE_URL}/v1/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener el token JWT del localStorage
  getToken(): string | null {
    return localStorage.getItem(environment.TOKEN_KEY);
  }

  // Obtener el username del localStorage
  getUsername(): string | null {
    return localStorage.getItem(environment.USERNAME_KEY);
  }

  // Obtener el rol del localStorage
  getRole(): string | null {
    return localStorage.getItem(environment.ROLE_KEY);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(environment.TOKEN_KEY);
    localStorage.removeItem(environment.USERNAME_KEY);
    localStorage.removeItem(environment.ROLE_KEY);
    this.showMessage('¡Sesión cerrada exitosamente!', 'success');
    this.router.navigate(['/login']); // Redirigir al login al cerrar sesión
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // --- Métodos HTTP genéricos (para ser usados por otros servicios/componentes) ---
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}) // Solo añade el header si hay token
    });
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${environment.API_BASE_URL}${path}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${environment.API_BASE_URL}${path}`, body, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${environment.API_BASE_URL}${path}`, body, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${environment.API_BASE_URL}${path}`, body, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores HTTP global (para todos los métodos HTTP)
  private handleError(error: any) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status}\nMensaje: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = `Error: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    // No redirigimos aquí. La redirección por 401/403 debe ser manejada por un Interceptor.
    return throwError(() => error); // Re-lanzar el error para que el componente lo maneje
  }
}
