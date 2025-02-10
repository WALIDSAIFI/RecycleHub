import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-updateprofil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './updateprofil.component.html',

})
export class UpdateProfilComponent implements OnInit {
  profilForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profilForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      birthDate: ['', Validators.required],
      profileImage: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserSync();
    if (this.currentUser) {
      this.profilForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
        address: this.currentUser.address,
        city: this.currentUser.city,
        postalCode: this.currentUser.postalCode,
        birthDate: this.currentUser.birthDate,
        profileImage: this.currentUser.profileImage
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.profilForm.valid && this.currentUser) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const updatedUser: User = {
        ...this.currentUser,
        ...this.profilForm.value
      };

      this.authService.updateUser(updatedUser).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Profil mis à jour avec succès';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Une erreur est survenue lors de la mise à jour du profil';
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilForm.patchValue({
          profileImage: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
