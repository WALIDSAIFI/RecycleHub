import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import * as AuthActions from '../../store/auth/auth.actions';
import { AuthState } from '../../store/auth/auth.reducer';
import { Subscription } from 'rxjs';
import { selectAuthUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isProfileMenuOpen = false;
  private authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private store: Store<{ auth: AuthState }>,
    private router: Router
  ) {
    // S'abonner aux changements d'état de l'authentification
    this.authSubscription = this.store.select(selectAuthUser).subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // Fermer le menu si on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const profileMenu = document.getElementById('profile-menu');
    const profileButton = document.getElementById('profile-button');
    
    if (!profileMenu?.contains(event.target as Node) && 
        !profileButton?.contains(event.target as Node)) {
      this.isProfileMenuOpen = false;
    }
  }

  onLogout() {
    this.isProfileMenuOpen = false; // Fermer le menu
    this.store.dispatch(AuthActions.logout());
    this.authService.removeCurrentUser(); // S'assurer que l'utilisateur est supprimé du localStorage
    this.currentUser = null; // Mettre à jour explicitement currentUser
    this.router.navigate(['/login']);
  }
}
