import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CollecteService } from '../../services/collecte.service';
import { AuthService } from '../../services/auth.service';
import { Observable, map, of } from 'rxjs';

@Component({
  selector: 'app-add-collecte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-collecte.component.html',
  styleUrl: './add-collecte.component.scss'
})
export class AddCollecteComponent implements OnInit {
  collecteForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedPhotos: string[] = [];
  minDate: string;
  currentUserId: string | null = null;

  typeDechets = ['PLASTIQUE', 'VERRE', 'PAPIER', 'METAL'];
  creneauxHoraires = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  constructor(
    private fb: FormBuilder,
    private collecteService: CollecteService,
    private authService: AuthService,
    private router: Router
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.collecteForm = this.fb.group({
      type: ['', [Validators.required]],
      poids: ['', [
        Validators.required,
        Validators.min(1000),
        Validators.max(10000)
      ]],
      adresse: ['', [Validators.required]],
      dateCollecte: ['', [Validators.required]],
      creneauHoraire: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUserSync();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId = currentUser.id;
  }

  private checkCollectesEnCours(): Observable<boolean> {
    if (!this.currentUserId) {
      return of(false);
    }
    
    return this.collecteService.getUserCollectes(this.currentUserId).pipe(
      map(collectes => {
        const collectesEnCours = collectes.filter(c => 
          ['EN_ATTENTE', 'OCCUPEE', 'EN_COURS'].includes(c.statut)
        );
        
        console.log('Nombre de collectes en cours:', collectesEnCours.length);
        
        if (collectesEnCours.length >= 3) {
          throw new Error('Vous avez déjà 3 collectes en cours. Veuillez attendre qu\'une collecte soit terminée avant d\'en créer une nouvelle.');
        }
        
        return true;
      })
    );
  }

  onPhotoSelected(event: any) {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedPhotos.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removePhoto(index: number) {
    this.selectedPhotos.splice(index, 1);
  }

  isFormValid(): boolean {
    return this.collecteForm.valid;
  }

  onSubmit() {
    this.markFormGroupTouched(this.collecteForm);
    
    if (this.collecteForm.valid && !this.loading) {
      const currentUser = this.authService.getCurrentUserSync();
      if (!currentUser) {
        this.error = 'Vous devez être connecté pour créer une collecte';
        return;
      }

      const poids = Number(this.collecteForm.get('poids')?.value);
      if (isNaN(poids) || poids < 1000 || poids > 10000) {
        this.error = 'Le poids doit être entre 1000g et 10000g';
        return;
      }

      this.loading = true;
      this.error = null;

      // Vérifier d'abord le nombre de collectes en cours
      this.checkCollectesEnCours().subscribe({
        next: (canAdd) => {
          if (!canAdd) {
            this.loading = false;
            this.error = 'Impossible de créer une nouvelle collecte';
            return;
          }

          const collecteData = {
            ...this.collecteForm.value,
            userId: currentUser.id,
            photos: this.selectedPhotos,
            dechets: [{
              type: this.collecteForm.get('type')?.value,
              poids: poids
            }],
            poidsTotal: poids
          };

          this.collecteService.addCollecte(collecteData).subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/home']);
            },
            error: (error) => {
              this.loading = false;
              this.error = error.message || 'Une erreur est survenue lors de la création de la collecte';
            }
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message;
        }
      });
    } else {
      this.error = 'Veuillez remplir tous les champs obligatoires correctement';
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
