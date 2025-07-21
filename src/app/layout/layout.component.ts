// src/app/layout/layout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterModule } from '@angular/router'; // Importar RouterLink y RouterOutlet
import { AuthService } from '../services/auth.service'; // Importar AuthService

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // Necesario para los enlaces de navegación
    RouterOutlet, // Necesario para cargar las rutas hijas
    RouterModule // Importar RouterModule para las rutas
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  username: string | null = null;
  role: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obtener el nombre de usuario y el rol al inicializar el layout
    this.username = this.authService.getUsername();
    this.role = this.authService.getRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
  }
}
