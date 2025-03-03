import { Routes } from '@angular/router';
import { LoginPage } from './auth/pages/login/login.page';
import { AcceuilPage } from './acceuil/acceuil.page';
import { SignupPage } from './auth/pages/signup/signup.page';
import { ForgotPasswordPage } from './auth/pages/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './auth/pages/reset-password/reset-password.page';

export const routes: Routes = [
  { path: '', redirectTo: '/acceuil', pathMatch: 'full' },
  { path: 'acceuil', component: AcceuilPage },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { path: 'forgot-password', component: ForgotPasswordPage }, 
  { path: 'reset-password',component: ResetPasswordPage },
  {
    path: 'signup',
    loadComponent: () => import('./auth/pages/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/pages/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/pages/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },

  
];
