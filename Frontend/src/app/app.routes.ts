import { Routes } from '@angular/router';
import { LoginPage } from './auth/pages/login/login.page';
import { AcceuilPage } from './acceuil/acceuil.page';
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'acceuil', component: AcceuilPage },
  { path: 'login', component: LoginPage },
  
];
