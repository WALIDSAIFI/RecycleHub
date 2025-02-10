import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AuthState } from '../../store/auth/auth.reducer';
import { Subscription, Observable } from 'rxjs';
import { selectAuthUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isProfileMenuOpen = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private store: Store<{ auth: AuthState }>,
    private router: Router
  ) {
    this.currentUser$ = this.store.select(selectAuthUser);
  }

  ngOnInit() {
    this.authSubscription = this.currentUser$.subscribe();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const profileMenu = document.getElementById('profile-menu');
    const profileButton = document.getElementById('profile-button');
    
    if (!profileMenu?.contains(event.target as Node) && 
        !profileButton?.contains(event.target as Node)) {
      this.isProfileMenuOpen = false;
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isProfileMenuOpen = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
      }
    });
  }
}
