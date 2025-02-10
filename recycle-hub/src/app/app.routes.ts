import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SinupComponent } from './components/sinup/sinup.component';
import { HomeComponent } from './components/home/home.component';
import { AddCollecteComponent } from './components/add-collecte/add-collecte.component';
import { AuthGuard, AdminGuard } from './guards/auth.guard';
import { UpdateCollecteComponent } from './components/update-collecte/update-collecte.component';
import { UpdateProfilComponent } from './components/updateprofil/updateprofil.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SinupComponent },
    { path: 'home', component: HomeComponent },
    { 
        path: 'add-collecte', 
        component: AddCollecteComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'edit-collecte/:id',
        component: UpdateCollecteComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'updateprofil',
        component: UpdateProfilComponent,
        canActivate: [AuthGuard]
    }
];
