import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Collecte } from '../../models/collecte.model';
import { CollecteService } from '../../services/collecte.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class HomeComponent implements OnInit {
  collectes: Collecte[] = [];
  isAdmin = false;
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;

  // Points par type de déchet
  private readonly POINTS_PAR_TYPE = {
    'PLASTIQUE': 2,
    'VERRE': 1,
    'PAPIER': 1,
    'METAL': 5
  };

  constructor(
    private collecteService: CollecteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }
        this.currentUserId = user.id;
        this.isAdmin = user.role === 'ADMIN';
        if (this.isAdmin) {
          this.getAllCollectes();
        } else {
          this.getUserCollectes(user.id);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  getAllCollectes(): void {
    this.loading = true;
    this.collecteService.getAllCollectes().subscribe({
      next: (collectes) => {
        this.collectes = this.processCollectes(collectes);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des collectes:', error);
        this.error = 'Impossible de récupérer les collectes';
        this.loading = false;
      }
    });
  }

  getUserCollectes(userId: string): void {
    this.loading = true;
    this.collecteService.getUserCollectes(userId).subscribe({
      next: (collectes) => {
        this.collectes = this.processCollectes(collectes);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des collectes:', error);
        this.error = 'Impossible de récupérer vos collectes';
        this.loading = false;
      }
    });
  }

  processCollectes(collectes: Collecte[]): Collecte[] {
    return collectes.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }

  onStatusChange(event: Event, collecteId: string): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Collecte['statut'];
    
    this.collecteService.updateCollecte(collecteId, { statut: newStatus }).subscribe({
      next: (updatedCollecte) => {
        this.collectes = this.collectes.map(c => 
          c.id === collecteId ? updatedCollecte : c
        );
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.error = 'Impossible de mettre à jour le statut';
      }
    });
  }

  onDeleteCollecte(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette collecte ?')) {
      this.collecteService.deleteCollecte(id, this.isAdmin).subscribe({
        next: () => {
          this.collectes = this.collectes.filter(c => c.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error = 'Impossible de supprimer la collecte';
        }
      });
    }
  }

  onEditCollecte(id: string): void {
    this.router.navigate(['/edit-collecte', id]);
  }

  getStatusLabel(status: Collecte['statut']): string {
    const statusMap: Record<Collecte['statut'], string> = {
      'EN_ATTENTE': 'En attente',
      'OCCUPEE': 'Occupée',
      'EN_COURS': 'En cours',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return statusMap[status];
  }

  getStatusClass(status: Collecte['statut']): string {
    const statusClassMap: Record<Collecte['statut'], string> = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'OCCUPEE': 'bg-blue-100 text-blue-800',
      'EN_COURS': 'bg-blue-100 text-blue-800',
      'VALIDEE': 'bg-green-100 text-green-800',
      'REJETEE': 'bg-red-100 text-red-800'
    };
    return statusClassMap[status];
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${img.src}`);
    img.style.display = 'none';
  }

  // Calcule le total des points pour toutes les collectes validées
  getTotalPoints(): number {
    return this.collectes
      .filter(c => c.statut === 'VALIDEE')
      .reduce((total, collecte) => {
        return total + this.calculateCollectePoints(collecte);
      }, 0);
  }

  // Calcule les points pour un type spécifique de déchet
  getPointsByType(type: 'PLASTIQUE' | 'VERRE' | 'PAPIER' | 'METAL'): number {
    return this.collectes
      .filter(c => c.statut === 'VALIDEE')
      .reduce((total, collecte) => {
        const dechet = collecte.dechets.find(d => d.type === type);
        if (dechet) {
          return total + (dechet.poids / 1000) * this.POINTS_PAR_TYPE[type];
        }
        return total;
      }, 0);
  }

  // Calcule les points pour une collecte spécifique
  private calculateCollectePoints(collecte: Collecte): number {
    return collecte.dechets.reduce((total, dechet) => {
      return total + (dechet.poids / 1000) * this.POINTS_PAR_TYPE[dechet.type];
    }, 0);
  }

  // Convertit les points en bons d'achat
  convertPoints(points: number): void {
    const totalPoints = this.getTotalPoints();
    if (totalPoints < points) {
      this.error = 'Points insuffisants pour cette conversion';
      return;
    }

    let montant = 0;
    switch (points) {
      case 100:
        montant = 50;
        break;
      case 200:
        montant = 120;
        break;
      case 500:
        montant = 350;
        break;
      default:
        this.error = 'Montant de conversion invalide';
        return;
    }

    // TODO: Implémenter la logique de conversion avec le service approprié
    console.log(`Conversion de ${points} points en bon d'achat de ${montant} Dh`);
    // Afficher un message de succès
    alert(`Félicitations ! Vous avez converti ${points} points en un bon d'achat de ${montant} Dh`);
  }
}
