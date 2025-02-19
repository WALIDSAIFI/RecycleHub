import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../store/auth/auth.selectors';
import { AuthState } from '../../store/auth/auth.reducer';

@Component({
  selector: 'app-sinup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sinup.component.html',
  styleUrl: './sinup.component.scss'
})
export class SinupComponent {
  signupForm: FormGroup;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^0[1-9][0-9]{8}$/)]],
      birthDate: ['', Validators.required],
      profileImage: [null]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Convertir l'image en base64 si nécessaire
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.signupForm.patchValue({
          profileImage: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      const { password, ...userData } = formValue;
      
      // Dispatch l'action d'inscription
      this.store.dispatch(AuthActions.register({ 
        user: {
          ...userData,
          profileImage: this.signupForm.get('profileImage')?.value
        }, 
        password 
      }));
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
