import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CollecteService } from '../../services/collecte.service';
import { AuthService } from '../../services/auth.service';
import { Collecte } from '../../models/collecte.model';

@Component({
  selector: 'app-update-collecte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-collecte.component.html',
  styleUrl: './update-collecte.component.scss'
})
export class UpdateCollecteComponent implements OnInit {
  collecteForm: FormGroup;
  loading = false;
  error: string = '';
  collecteId: string = '';
  selectedPhotos: string[] = [];
  minDate: string;

  typeDechets = ['PLASTIQUE', 'VERRE', 'PAPIER', 'CARTON'];
  creneauxHoraires = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '14:00 - 16:00',
    '16:00 - 18:00'
  ];

  constructor(
    private fb: FormBuilder,
    private collecteService: CollecteService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.collecteForm = this.fb.group({
      type: ['', Validators.required],
      poids: ['', [Validators.required, Validators.min(1000), Validators.max(10000)]],
      adresse: ['', Validators.required],
      dateCollecte: ['', Validators.required],
      creneauHoraire: ['', Validators.required],
      notes: [''],
      photos: [[]]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    const currentUser = this.authService.getCurrentUserSync();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Récupérer l'ID de la collecte depuis l'URL
    this.collecteId = this.route.snapshot.params['id'];
    if (!this.collecteId) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadCollecte();
  }

  loadCollecte(): void {
    this.collecteService.getCollecteById(this.collecteId).subscribe({
      next: (collecte) => {
        this.collecteForm.patchValue({
          type: collecte.dechets[0].type,
          poids: collecte.dechets[0].poids,
          adresse: collecte.adresse,
          dateCollecte: collecte.dateCollecte.split('T')[0],
          creneauHoraire: collecte.creneauHoraire,
          notes: collecte.notes
        });
        this.selectedPhotos = collecte.photos || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la collecte:', error);
        this.error = 'Erreur lors du chargement de la collecte';
      }
    });
  }

  onPhotoSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedPhotos.push(e.target.result);
          this.collecteForm.patchValue({
            photos: this.selectedPhotos
          });
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removePhoto(index: number): void {
    this.selectedPhotos.splice(index, 1);
    this.collecteForm.patchValue({
      photos: this.selectedPhotos
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.markFormGroupTouched(this.collecteForm);
    
    if (this.collecteForm.valid) {
      this.loading = true;
      const formData = this.collecteForm.value;
      const currentUser = this.authService.getCurrentUserSync();
      
      if (!currentUser) {
        this.error = 'Vous devez être connecté pour modifier une collecte';
        return;
      }

      const collecteData = {
        ...formData,
        userId: currentUser.id,
        dechets: [{
          type: formData.type,
          poids: formData.poids
        }],
        photos: this.selectedPhotos,
        statut: 'EN_ATTENTE'
      };

      this.collecteService.updateCollecte(this.collecteId, collecteData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la mise à jour de la collecte:', error);
          this.error = 'Erreur lors de la mise à jour de la collecte';
        }
      });
    } else {
      this.error = 'Veuillez remplir correctement tous les champs requis';
    }
  }
}
