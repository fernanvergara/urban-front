// src/app/components/conductor/conductor.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule aquí
import { AuthService } from '../../services/auth.service';

interface Conductor {
  id: number | null;
  nombreCompleto: string;
  identificacion: string;
  fechaNacimiento: string; // (ej. "15/05/1985")
  telefono: string;
  activo: boolean;
}

@Component({
  selector: 'app-conductor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule ],
  templateUrl: './conductores.component.html',
  styleUrls: ['./conductores.component.css']
})
export class ConductoresComponent implements OnInit {
  // Modelo para el formulario de conductor
  conductor: Conductor = {
    id: null,
    nombreCompleto: '',
    identificacion: '',
    fechaNacimiento: '', // Formato DD/MM/YYYY
    telefono: '',
    activo: true
  };

  conductores: Conductor[] = []; // Lista para la tabla

  showSearchModal: boolean = false;
  searchId: number | null = null;
  searchIdentificacion: string = '';

  // Variables para el modal de confirmación de inactivación
  showConfirmModal: boolean = false;

  message: string | null = null;
  messageType: 'success' | 'error' | 'info' = 'info';

  constructor(private authService: AuthService) { } 

  ngOnInit(): void {
    this.cargarTodosLosConductores();
  }

  showMessage(msg: string, type: 'success' | 'error' | 'info'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  // Acción del botón "Nuevo"
  nuevoConductor(): void {
    this.conductor = {
      id: null,
      nombreCompleto: '',
      identificacion: '',
      fechaNacimiento: '', // Formato DD/MM/YYYY
      telefono: '',
      activo: true
    };
    this.showMessage('Ingrese los datos del nuevo conductor.', 'info');
  }

  /**
   * Formatea una cadena de fecha a 'DD/MM/YYYY' o valida si ya está en ese formato.
   * Maneja entradas 'YYYY-MM-DD' (típicas de input type="date") y las convierte.
   * @param dateString La cadena de fecha a formatear (ej. "1985-05-15" o "15/05/1985").
   * @returns La fecha formateada como 'DD/MM/YYYY' o null si el formato es inválido.
   */
  private formatDateForBackend(dateString: string): string | null {
    // Expresión regular para DD/MM/YYYY
    const ddMMyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    // Expresión regular para YYYY-MM-DD
    const yyyyMMddRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (ddMMyyyyRegex.test(dateString)) {
      // Si ya está en DD/MM/YYYY, lo retornamos tal cual
      return dateString;
    } else if (yyyyMMddRegex.test(dateString)) {
      // Si está en YYYY-MM-DD, lo convertimos a DD/MM/YYYY
      const parts = dateString.split('-'); // [YYYY, MM, DD]
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
      }
    }

    // Si no coincide con ninguno de los formatos esperados
    console.warn('Fecha de nacimiento en formato inesperado:', dateString);
    this.showMessage('Formato de fecha de nacimiento inválido. Use DD/MM/YYYY.', 'error');
    return null;
  }
  
  abrirModalBusqueda(): void {
    this.searchId = null;
    this.searchIdentificacion = '';
    this.showSearchModal = true;
  }

  cerrarModalBusqueda(): void {
    this.showSearchModal = false;
  }

  // Acción del botón "Buscar"
  buscarConductor(): void {
    if (this.searchId) {
      // Buscar por ID si está presente
      this.authService.get<Conductor>(`/v1/conductores/${this.searchId}`).subscribe({
        next: (data) => {
          // Al cargar, si la fecha viene en YYYY-MM-DD (por ejemplo, si no se aplicó @JsonFormat en el GET),
          // la convertimos a DD/MM/YYYY para que se muestre correctamente en el input de texto.
          // Si el backend ya la envía como DD/MM/YYYY, esta conversión no hará nada.
          const displayedFechaNacimiento = this.formatDateForBackend(data.fechaNacimiento) || data.fechaNacimiento;
          this.conductor = { ...data, fechaNacimiento: displayedFechaNacimiento };
          this.showMessage(`Conductor ${data.nombreCompleto} encontrado por ID.`, 'success');
          this.cerrarModalBusqueda();
        },
        error: (error) => {
          console.error('Error al buscar conductor por ID: ', error);
          this.showMessage(`Error al buscar conductor por ID ${this.conductor.id}: ${error.message}`, 'error');
        }
      });
    } else if (this.searchIdentificacion) {
      // Buscar por Identificación si no hay ID pero sí identificación
      this.authService.get<Conductor>(`/v1/conductores/ident/${this.searchIdentificacion}`).subscribe({
        next: (data) => {
          const displayedFechaNacimiento = this.formatDateForBackend(data.fechaNacimiento) || data.fechaNacimiento;
          this.conductor = { ...data, fechaNacimiento: displayedFechaNacimiento };
          this.showMessage(`Conductor ${data.nombreCompleto} encontrado por Identificación.`, 'success');
          this.cerrarModalBusqueda();
        },
        error: (error) => {
          console.error('Error al buscar conductor por Identificación', error);
          this.showMessage(`Error al buscar conductor por Identificación ${this.conductor.identificacion}: ${error.message}`, 'error');
        }
      });
    } else {
      this.showMessage('Por favor, ingrese un ID o una Identificación para buscar.', 'info');
    }
  }

  // Acción del botón "Guardar" (crear o actualizar)
  guardarConductor(): void {
    if (!this.conductor.nombreCompleto || !this.conductor.identificacion || !this.conductor.fechaNacimiento || !this.conductor.telefono) {
      this.showMessage('Todos los campos son obligatorios.', 'error');
      return;
    }

    // Formatear la fecha antes de enviarla al backend
    const formattedDate = this.formatDateForBackend(this.conductor.fechaNacimiento);
    if (formattedDate === null) {
      // El mensaje de error ya fue mostrado por formatDateForBackend
      return;
    }

    // Crear una copia del objeto conductor para enviar, con la fecha formateada
    const conductorToSend = { ...this.conductor, fechaNacimiento: formattedDate };

    if (this.conductor.id) {
      // Actualizar
      this.authService.put<Conductor>(`/v1/conductores/${this.conductor.id}`, conductorToSend).subscribe({
        next: (data) => {
          this.showMessage(`Conductor ${data.nombreCompleto} actualizado exitosamente.`, 'success');
          this.cargarTodosLosConductores(); // Recargar la tabla
          this.nuevoConductor(); // Limpiar el formulario
        },
        error: (error) => {
          console.error('Error al actualizar conductor', error);
          this.showMessage('Error al actualizar conductor: ' + (error.error?.message || error.message), 'error');
        }
      });
    } else {
      // Crear nuevo conductor
      this.authService.post<Conductor>(`/v1/conductores`, conductorToSend).subscribe({
        next: (data) => {
          this.conductor = data; // Cargar el conductor recién creado con su ID
          this.showMessage('Conductor creado exitosamente.', 'success');
          this.cargarTodosLosConductores(); // Recargar la tabla
          this.nuevoConductor(); // Limpiar el formulario
        },
        error: (error) => {
          console.error('Error al crear conductor', error);
          this.showMessage('Error al crear conductor: ' + (error.error?.message || error.message), 'error');
        }
      });
    }
  }

  abrirModalConfirmacion(): void {
    if (this.conductor.id === null) {
      this.showMessage('Debes seleccionar un conductor para cambiar su estado.', 'info');
      return;
    }
    this.showConfirmModal = true;
  }

  cerrarModalConfirmacion(): void {
    this.showConfirmModal = false;
  }

  // Confirmar inactivación
  inactivarConductor(): void {
    if (!this.conductor.id) {
      this.showMessage('Debes seleccionar un conductor para cambiar su estado.', 'info');
      return;
    } 

    const nuevoEstado = !this.conductor.activo; // Cambiar al estado opuesto
    this.authService.patch<Conductor>(`/v1/conductores/${this.conductor.id}/estado?activo=${nuevoEstado}`, {}).subscribe({
      next: (data) => {
        this.showMessage(`Conductor ${nuevoEstado ? 'activado' : 'inactivado'} exitosamente.`, 'success');
        this.cargarTodosLosConductores(); // Recargar la tabla
        this.cerrarModalConfirmacion();
      },
      error: (error) => {
        console.error('Error al inactivar conductor', error);
        this.showMessage('Error al cambiar estado del conductor: ' + (error.error?.message || error.message), 'error');
        this.cerrarModalConfirmacion();
      }
    });
  }

  // Cargar todos los conductores para la tabla
  cargarTodosLosConductores(): void {
    this.authService.get<Conductor[]>('/v1/conductores/todos').subscribe({
      next: (data) => {
        this.conductores = data.map(c => {
          // Al cargar para la tabla, también aseguramos que la fecha se muestre en el formato correcto
          const displayedFechaNacimiento = this.formatDateForBackend(c.fechaNacimiento) || c.fechaNacimiento;
          return { ...c, fechaNacimiento: displayedFechaNacimiento };
        });
      },
      error: (error) => {
        this.showMessage('Error al cargar listado de todos los conductores: ' + (error.error?.message || error.message), 'error');
        console.error('Error al cargar conductores', error);
      }
    });
  }

  // Doble clic en la tabla para cargar conductor
  seleccionarConductorParaEdicion(conductor: Conductor): void {
    const displayedFechaNacimiento = this.formatDateForBackend(conductor.fechaNacimiento) || conductor.fechaNacimiento;
    this.conductor = { ...conductor, fechaNacimiento: displayedFechaNacimiento };
    this.showMessage(`Conductor ${conductor.nombreCompleto} seleccionado para edición.`, 'info');
  }
  
}
