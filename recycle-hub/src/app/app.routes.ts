import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SinupComponent } from './components/sinup/sinup.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SinupComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] }
];
