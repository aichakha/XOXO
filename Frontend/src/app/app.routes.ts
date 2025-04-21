import { Routes } from '@angular/router';
import { LoginPage } from './auth/pages/login/login.page';
import { AcceuilPage } from './acceuil/acceuil.page';
import { SignupPage } from './auth/pages/signup/signup.page';
import { ForgotPasswordPage } from './auth/pages/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './auth/pages/reset-password/reset-password.page';
import { HistoryPage } from './history/history.page';
import { ContactPage } from './contact/contact.page';
import { ViewPage } from './view/view.page';
import { AcceuilUserPage } from './acceuil-user/acceuil-user.page';
import { AuthGuard } from './auth/auth.guard';
export const routes: Routes = [
  { path: '', redirectTo: '/acceuil', pathMatch: 'full' },
  { path: 'acceuil', component: AcceuilPage },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'history', component: HistoryPage },
  { path: 'reset-password',component: ResetPasswordPage },
  { path: 'contact',component: ContactPage },
  {path: 'view',component: ViewPage },
  {path: 'acceuil-user',component: AcceuilUserPage, canActivate: [AuthGuard]},
  {path: 'history',component: HistoryPage, canActivate: [AuthGuard]},
  {
    path: 'signup',
    loadComponent: () => import('./auth/pages/signup/signup.page').then( m => m.SignupPage)
  },

    {
      path: 'acceuil-user',
      loadComponent: () => import('./acceuil-user/acceuil-user.page').then(m => m.AcceuilUserPage),
      canActivate: [AuthGuard]
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

    path: 'history',
    loadComponent: () => import('./history/history.page').then( m => m.HistoryPage), canActivate: [AuthGuard]
  },

  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.page').then( m => m.ContactPage)
  },


  {
    path: 'view',
    loadComponent: () => import('./view/view.page').then( m => m.ViewPage), canActivate: [AuthGuard]
  },










];
