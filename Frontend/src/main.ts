import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/auth/auth.interceptor';
import { appProviders } from './app/providers';
import { addIcons } from 'ionicons';
import { heart, menu,heartOutline,trash,
  shareSocialOutline,shareOutline,mailOutline,pin,downloadOutline,linkOutline ,copyOutline, menuOutline,languageOutline,logoUsd,logoEuro,globeOutline,earthOutline,documentOutline,documentTextOutline,expandOutline,contractOutline,ellipsisHorizontalOutline,createOutline,saveOutline,
} from 'ionicons/icons';

// ✅ Enregistrement des icônes
addIcons({
  heart,pin,
  trash ,shareSocialOutline,
  menu,mailOutline,
  linkOutline,
  heartOutline,
  downloadOutline,
  documentTextOutline,
  copyOutline,shareOutline,
  menuOutline,languageOutline,
  logoUsd,logoEuro,globeOutline,
  earthOutline,documentOutline,expandOutline,
  contractOutline,ellipsisHorizontalOutline,createOutline,
  saveOutline
});
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ...appProviders,
  ],
});
