// src/app/components/usuarios/usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Aún necesario para proveer HttpClient
import { AuthService } from '../../services/auth.service'; // Usaremos este servicio para las llamadas HTTP

// Definición de interfaces para los datos que esperamos de la API
interface Usuario {
  id: number | null;
  username: string;
  password?: string; // Opcional para mostrar, no siempre se edita
  rol: string; // ADMIN, CONDUCTOR, CLIENTE
  activo: boolean;
  conductor?: { // Asumiendo que el backend puede devolver el objeto Conductor anidado
    id: number;
    nombreCompleto: string;
  };
  cliente?: { // Asumiendo que el backend puede devolver el objeto Cliente anidado
    id: number;
    nombreCompleto: string;
  };
}

// Los roles son strings simples, no necesitan una interfaz compleja
type Rol = string;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // HttpClientModule es necesario para que provideHttpClient funcione
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'] // Mantendremos el CSS personalizado por ahora
})
export class UsuariosComponent implements OnInit {
  usuario: Usuario = {
    id: null,
    username: '',
    password: '',
    rol: '',
    activo: true
  };

  usuarios: Usuario[] = [];
  roles: Rol[] = []; // Lista de roles disponibles

  showSearchModal: boolean = false;
  searchId: number | null = null;
  searchUsername: string = '';

  showConfirmModal: boolean = false;

  message: string | null = null;
  messageType: 'success' | 'error' | 'info' = 'info';

  constructor(private authService: AuthService) { } // Inyectamos AuthService

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarTodosLosUsuarios();
  }

  showMessage(msg: string, type: 'success' | 'error' | 'info'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  nuevoUsuario(): void {
    this.usuario = {
      id: null,
      username: '',
      password: '',
      rol: '',
      activo: true
    };
    this.showMessage('Formulario listo para nuevo usuario.', 'info');
  }

  abrirModalBusqueda(): void {
    this.searchId = null;
    this.searchUsername = '';
    this.showSearchModal = true;
  }

  cerrarModalBusqueda(): void {
    this.showSearchModal = false;
  }

  buscarUsuario(): void {
    if (this.searchId) {
      this.authService.get<Usuario>(`/v1/usuarios/${this.searchId}`).subscribe({
        next: (data) => {
          this.usuario = data;
          this.showMessage('Usuario encontrado por ID.', 'success');
          this.cerrarModalBusqueda();
        },
        error: (error) => {
          console.error('Error al buscar usuario por ID: ', error);
          this.showMessage('Usuario no encontrado por ID.', 'error');
        }
      });
    } else if (this.searchUsername) {
      this.authService.get<Usuario>(`/v1/usuarios/username/${this.searchUsername}`).subscribe({ // Endpoint es /api/v1/usuarios/{username}
        next: (data) => {
          this.usuario = data;
          this.showMessage('Usuario encontrado por Username.', 'success');
          this.cerrarModalBusqueda();
        },
        error: (error) => {
          console.error('Error al buscar usuario por Username:', error);
          this.showMessage('Usuario no encontrado por Username.', 'error');
        }
      });
    } else {
      this.showMessage('Por favor, ingresa un ID o un Username para buscar.', 'info');
    }
  }

  guardarUsuario(): void {
    if (!this.usuario.username || !this.usuario.rol) {
      this.showMessage('El nombre de usuario y el rol son obligatorios.', 'error');
      return;
    }

    if (this.usuario.id) {
      // Actualizar usuario existente
      this.authService.put<Usuario>(`/v1/usuarios/${this.usuario.id}`, this.usuario).subscribe({
        next: (data) => {
          this.usuario = data;
          this.showMessage('Usuario actualizado exitosamente.', 'success');
          this.cargarTodosLosUsuarios();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.showMessage('Error al actualizar usuario: ' + (error.error?.message || error.message), 'error');
        }
      });
    } else {
      // Crear nuevo usuario
      if (!this.usuario.password) {
        this.showMessage('La contraseña es obligatoria para un nuevo usuario.', 'error');
        return;
      }
      this.authService.post<Usuario>(`/v1/usuarios`, this.usuario).subscribe({
        next: (data) => {
          this.usuario = data;
          this.showMessage('Usuario creado exitosamente.', 'success');
          this.cargarTodosLosUsuarios();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.showMessage('Error al crear usuario: ' + (error.error?.message || error.message), 'error');
        }
      });
    }
  }

  abrirModalConfirmacion(): void {
    if (this.usuario.id === null) {
      this.showMessage('Debes seleccionar un usuario para cambiar su estado.', 'info');
      return;
    }
    this.showConfirmModal = true;
  }

  cerrarModalConfirmacion(): void {
    this.showConfirmModal = false;
  }

  inactivarUsuario(): void {
    if (this.usuario.id === null) {
      this.showMessage('No hay usuario seleccionado para cambiar su estado.', 'error');
      this.cerrarModalConfirmacion();
      return;
    }

    const nuevoEstado = !this.usuario.activo; // Cambiar al estado opuesto
    this.authService.patch<Usuario>(`/v1/usuarios/${this.usuario.id}/estado?activo=${nuevoEstado}`, {}).subscribe({
      next: (data) => {
        this.usuario = data;
        this.showMessage(`Usuario ${nuevoEstado ? 'activado' : 'inactivado'} exitosamente.`, 'success');
        this.cargarTodosLosUsuarios();
        this.cerrarModalConfirmacion();
      },
      error: (error) => {
        console.error('Error al cambiar estado del usuario:', error);
        this.showMessage('Error al cambiar estado del usuario: ' + (error.error?.message || error.message), 'error');
        this.cerrarModalConfirmacion();
      }
    });
  }

  cargarRoles(): void {
    this.authService.get<Rol[]>(`/v1/usuarios/roles`).subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.showMessage('Error al cargar roles.', 'error');
      }
    });
  }

  cargarTodosLosUsuarios(): void {
    this.authService.get<Usuario[]>(`/v1/usuarios/todos`).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.showMessage('Usuarios cargados exitosamente.', 'info');
      },
      error: (error) => {
        console.error('Error al cargar todos los usuarios:', error);
        this.showMessage('Error al cargar usuarios.', 'error');
      }
    });
  }

  seleccionarUsuarioParaEdicion(usuario: Usuario): void {
    this.usuario = { ...usuario, password: '' }; // No cargar la contraseña
    this.showMessage(`Usuario ${usuario.username} seleccionado para edición.`, 'info');
  }
}
