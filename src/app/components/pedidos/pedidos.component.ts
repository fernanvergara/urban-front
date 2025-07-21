import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-4xl font-bold text-blue-700 mb-4">¡Bienvenido a Pedidos!</h2>
      <p class="text-lg text-gray-700">Esta es la página principal de gestión de pedidos.</p>
      <p class="text-md text-gray-500 mt-2">Pronto añadiremos más funcionalidades aquí.</p>
    </div>
  `,
  styleUrls: ['./pedidos.component.css'] // Puedes crear este archivo si necesitas estilos específicos
})
export class PedidosComponent {
  // Aquí irá la lógica para la gestión de pedidos
}
