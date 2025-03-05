import { Routes } from '@angular/router';
import { LoginPage } from './auth/pages/login/login.page';
import { AcceuilPage } from './acceuil/acceuil.page';
import { SignupPage } from './auth/pages/signup/signup.page';
import { ForgotPasswordPage } from './auth/pages/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './auth/pages/reset-password/reset-password.page';
<<<<<<< HEAD
import { HistoryPage } from './history/history.page';
=======
import { ContactPage } from './contact/contact.page';
>>>>>>> d7d5fc38fc9ae51a89110471040d064f4704f3d6

export const routes: Routes = [
  { path: '', redirectTo: '/acceuil', pathMatch: 'full' },
  { path: 'acceuil', component: AcceuilPage },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
<<<<<<< HEAD
  { path: 'history', component: HistoryPage },

=======
  { path: 'reset-password',component: ResetPasswordPage },
  { path: 'contact',component: ContactPage },
>>>>>>> d7d5fc38fc9ae51a89110471040d064f4704f3d6
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
  {
<<<<<<< HEAD
    path: 'history',
    loadComponent: () => import('./history/history.page').then( m => m.HistoryPage)
  },

=======
    path: 'contact',
    loadComponent: () => import('./contact/contact.page').then( m => m.ContactPage)
  },
>>>>>>> d7d5fc38fc9ae51a89110471040d064f4704f3d6


];
