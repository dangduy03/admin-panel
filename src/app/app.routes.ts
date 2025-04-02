import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuardFn } from '../guards/admin.guard';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'admin', component: AdminComponent, canActivate: [AdminGuardFn],
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes) // Lazy load admin routes
    },

];
