import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/auth.service';
import { CollecteService } from '../../services/collecte.service';
import { User } from '../../models/user.model';
import { Collecte } from '../../models/collecte.model';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { AuthState } from '../../store/auth/auth.reducer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  collectes: Collecte[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private collecteService: CollecteService,
    private store: Store<{ auth: AuthState }>,
    private router: Router
  ) {}

  ngOnInit() {
    this.store.select(selectAuthUser).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadCollectes();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadCollectes() {
    if (this.currentUser) {
      this.collecteService.getUserCollectes(this.currentUser.id).subscribe({
        next: (collectes) => {
          this.collectes = collectes;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    }
  }

  onDeleteCollecte(collecteId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de collecte ?')) {
      this.collecteService.deleteCollecte(collecteId).subscribe({
        next: () => {
          this.collectes = this.collectes.filter(c => c.id !== collecteId);
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'status-waiting';
      case 'OCCUPEE': return 'status-busy';
      case 'EN_COURS': return 'status-progress';
      case 'VALIDEE': return 'status-success';
      case 'REJETEE': return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'OCCUPEE': return 'Occupée';
      case 'EN_COURS': return 'En cours';
      case 'VALIDEE': return 'Validée';
      case 'REJETEE': return 'Rejetée';
      default: return statut;
    }
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/login']);
  }
}
