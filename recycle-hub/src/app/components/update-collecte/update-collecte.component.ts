import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollecteService } from '../../services/collecte.service';
import { AuthService } from '../../services/auth.service';
import { Collecte } from '../../models/collecte.model';

@Component({
  selector: 'app-update-collecte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-collecte.component.html',
  styleUrl: './update-collecte.component.scss'
})
export class UpdateCollecteComponent implements OnInit {
  collecteForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedPhotos: string[] = [];
  minDate: string;
  collecteId: string;
  currentCollecte: Collecte | null = null;

  typeDechets = ['PLASTIQUE', 'VERRE', 'PAPIER', 'METAL'];
  creneauxHoraires = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  constructor(
    private fb: FormBuilder,
    private collecteService: CollecteService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.collecteId = this.route.snapshot.params['id'];
    this.collecteForm = this.fb.group({
      type: ['', Validators.required],
      poids: ['', [
        Validators.required,
        Validators.min(1000),
        Validators.max(10000)
      ]],
      adresse: ['', Validators.required],
      dateCollecte: ['', Validators.required],
      creneauHoraire: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadCollecte();
  }

  loadCollecte() {
    this.loading = true;
    this.collecteService.getCollecteById(this.collecteId).subscribe({
      next: (collecte) => {
        this.currentCollecte = collecte;
        if (collecte.statut !== 'EN_ATTENTE') {
          this.error = 'Cette collecte ne peut plus être modifiée';
          this.collecteForm.disable();
        } else {
          this.collecteForm.patchValue({
            type: collecte.dechets[0].type,
            poids: collecte.dechets[0].poids,
            adresse: collecte.adresse,
            dateCollecte: collecte.dateCollecte,
            creneauHoraire: collecte.creneauHoraire,
            notes: collecte.notes
          });
          this.selectedPhotos = collecte.photos || [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la collecte';
        this.loading = false;
      }
    });
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

  onSubmit() {
    if (this.collecteForm.valid && !this.loading) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.error = 'Vous devez être connecté pour modifier une collecte';
        return;
      }

      const poids = Number(this.collecteForm.get('poids')?.value);
      if (poids < 1000) {
        this.error = 'Le poids total doit être d\'au moins 1kg';
        return;
      }

      if (poids > 10000) {
        this.error = 'Le poids total ne peut pas dépasser 10kg';
        return;
      }

      this.loading = true;
      this.error = null;

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

      this.collecteService.updateCollecte(this.collecteId, collecteData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    }
  }
}
