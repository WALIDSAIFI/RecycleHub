import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  collectes: Collecte[] = [];
  loading = true;
  error: string | null = null;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private collecteService: CollecteService,
    private store: Store<{ auth: AuthState }>,
    private router: Router
  ) {}

  ngOnInit() {
    this.store.select(selectAuthUser).subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'ADMIN';
      if (user) {
        if (this.isAdmin) {
          this.loadAllCollectes();
        } else {
          this.loadUserCollectes(user.id);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadUserCollectes(userId: string) {
    this.collecteService.getUserCollectes(userId).subscribe({
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

  loadAllCollectes() {
    this.collecteService.getAllCollectes().subscribe({
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

  updateCollecteStatus(collecteId: string, newStatus: 'EN_ATTENTE' | 'OCCUPEE' | 'EN_COURS' | 'VALIDEE' | 'REJETEE') {
    if (!this.isAdmin) return;

    const collecte = this.collectes.find(c => c.id === collecteId);
    if (collecte) {
      this.collecteService.updateCollecte(collecteId, { ...collecte, statut: newStatus }).subscribe({
        next: (updatedCollecte) => {
          this.collectes = this.collectes.map(c => 
            c.id === collecteId ? updatedCollecte : c
          );
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  onAddCollecte() {
    this.router.navigate(['/add-collecte']);
  }

  onEditCollecte(id: string) {
    this.router.navigate(['/edit-collecte', id]);
  }

  onDeleteCollecte(collecteId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette collecte ?')) {
      this.loading = true;
      this.error = null;
      
      this.collecteService.deleteCollecte(collecteId).subscribe({
        next: () => {
          this.collectes = this.collectes.filter(c => c.id !== collecteId);
          this.loading = false;
          // Recharger les collectes après la suppression
          if (this.isAdmin) {
            this.loadAllCollectes();
          } else {
            this.loadUserCollectes(this.currentUser?.id || '');
          }
        },
        error: (error) => {
          this.error = error.message || 'Erreur lors de la suppression de la collecte';
          this.loading = false;
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-700';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-700';
      case 'VALIDEE':
        return 'bg-green-100 text-green-700';
      case 'REJETEE':
        return 'bg-red-100 text-red-700';
      case 'OCCUPEE':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'OCCUPEE': return 'Occupée';
      case 'EN_COURS': return 'En cours';
      case 'VALIDEE': return 'Validée';
      case 'REJETEE': return 'Rejetée';
      default: return status;
    }
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/login']);
  }

  onStatusChange(event: Event, collecteId: string) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'EN_ATTENTE' | 'OCCUPEE' | 'EN_COURS' | 'VALIDEE' | 'REJETEE';
    this.updateCollecteStatus(collecteId, newStatus);
  }
}
