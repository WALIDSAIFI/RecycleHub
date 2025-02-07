import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CollecteService } from '../../services/collecte.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-collecte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-collecte.component.html',
  styleUrl: './add-collecte.component.scss'
})
export class AddCollecteComponent implements OnInit {
  collecteForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedPhotos: string[] = [];
  minDate: string;

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
    // Plus besoin d'initialiser un déchet
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
    if (this.collecteForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.error = 'Vous devez être connecté pour créer une collecte';
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

      this.collecteService.addCollecte(collecteData).subscribe({
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
