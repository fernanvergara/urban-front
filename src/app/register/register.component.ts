// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- ¡IMPORTANTE!
import { CommonModule } from '@angular/common'; // <-- ¡IMPORTANTE!
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, // Necesario para *ngIf
    FormsModule,  // Necesario para [(ngModel)]
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  regUsername = '';
  regPassword = '';
  regRole: 'CLIENTE' | 'CONDUCTOR' | 'ADMIN' = 'CLIENTE';
  conductorId: number | null = null;
  clienteId: number | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  async handleRegister() {
    const requestBody: any = {
      username: this.regUsername,
      password: this.regPassword,
      rol: this.regRole,
    };

    if (this.regRole === 'CONDUCTOR' && this.conductorId) {
      requestBody.conductorId = this.conductorId;
    }
    if (this.regRole === 'CLIENTE' && this.clienteId) {
      requestBody.clienteId = this.clienteId;
    }

    try {
      await this.authService.register(requestBody).toPromise();
      this.authService.showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      const errorMessage = error.error ? (error.error.message || JSON.stringify(error.error)) : error.message;
      this.authService.showMessage(`Error al registrar: ${errorMessage}`, 'error');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}