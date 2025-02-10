import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getters pour la validation des champs
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  // Méthodes de gestion des champs
  clearField(fieldName: string) {
    this.loginForm.get(fieldName)?.setValue('');
    this.loginForm.get(fieldName)?.markAsUntouched();
    this.error = null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Validation et soumission du formulaire
  onSubmit() {
    this.formSubmitted = true;
    this.error = null;

    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (user) => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          if (error.message === 'Invalid email or password') {
            this.error = 'L\'email ou le mot de passe est incorrect';
          } else if (error.message === 'Email and password are required') {
            this.error = 'Veuillez remplir tous les champs';
          } else {
            this.error = 'Une erreur est survenue lors de la connexion';
          }
          console.error('Erreur de connexion:', error);
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });

      if (this.loginForm.get('email')?.hasError('required') || 
          this.loginForm.get('password')?.hasError('required')) {
        this.error = 'Veuillez remplir tous les champs';
      } else if (this.loginForm.get('email')?.hasError('email')) {
        this.error = 'Veuillez entrer une adresse email valide';
      } else if (this.loginForm.get('password')?.hasError('minlength')) {
        this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
  }

  // Méthodes utilitaires pour les classes CSS
  getInputClasses(controlName: string) {
    const control = this.loginForm.get(controlName);
    return {
      'border-red-300 focus:border-red-500': control?.invalid && (control?.touched || this.formSubmitted),
      'border-green-300 focus:border-green-500': control?.valid && control?.touched
    };
  }

  getIconClasses(controlName: string) {
    const control = this.loginForm.get(controlName);
    return {
      'text-red-500': control?.invalid && (control?.touched || this.formSubmitted),
      'text-green-500': control?.valid && control?.touched,
      'text-gray-400': !control?.touched
    };
  }
}
