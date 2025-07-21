// src/app/app.routes.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';

import { ClientesComponent } from './components/clientes/clientes.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { VehiculosComponent } from './components/vehiculos/vehiculos.component';
import { ConductoresComponent } from './components/conductores/conductores.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/pedidos', pathMatch: 'full' },
      { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
      { path: 'conductores', component: ConductoresComponent, canActivate: [AuthGuard] },
      { path: 'vehiculos', component: VehiculosComponent, canActivate: [AuthGuard] },
      { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }