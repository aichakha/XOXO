import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';


export const appProviders = [
  provideHttpClient(withInterceptors([authInterceptor]))
];
