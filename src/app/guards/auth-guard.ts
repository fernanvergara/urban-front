// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.authService.getToken()) {
      return true; // Si hay token, permite el acceso a la ruta
    } else {
      // Si no hay token, redirige al login y muestra un mensaje
      this.authService.showMessage('Necesitas iniciar sesión para acceder a esta página.', 'error');
      return this.router.createUrlTree(['/login']);
    }
  }
}
