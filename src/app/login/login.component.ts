// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginUsername = '';
  loginPassword = '';
  message: { text: string | null, type: 'success' | 'error' | 'info' } = { text: null, type: 'success' };

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Suscribirse a los mensajes del servicio de autenticación
    this.authService.message$.subscribe(msg => {
      this.message = { text: msg.message, type: msg.type };
    });
  }

  async handleLogin(): Promise<void> {
    try {
      await this.authService.login({ username: this.loginUsername, password: this.loginPassword }).toPromise();
      this.authService.showMessage('¡Inicio de sesión exitoso!', 'success');
      // Redirigir al usuario a la nueva página de menú
      this.router.navigate(['/pedidos']); // <-- ¡CAMBIO AQUÍ!
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Error desconocido al iniciar sesión.';
      this.authService.showMessage(`Error al iniciar sesión: ${errorMessage}`, 'error');
      console.error('Error de login:', error);
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
