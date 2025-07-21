// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importar AuthService

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) {} // Inyectar AuthService

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken(); // Obtener el token del AuthService

    if (token) {
      // Clonar la solicitud y añadir el encabezado de autorización
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Continuar con la solicitud y manejar errores
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Si es 401 (No autorizado) o 403 (Prohibido)
          // Limpiar el token y redirigir al login
          this.authService.logout(); // Esto también redirige al login
          this.authService.showMessage('Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.', 'error');
        }
        return throwError(() => error); // Re-lanzar el error
      })
    );
  }
}
