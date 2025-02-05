import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../store/auth/auth.selectors';

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

  constructor(
    private fb: FormBuilder,
    private store: Store
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
      profileImage: ['']
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      const { password, ...userData } = formValue;
      this.store.dispatch(AuthActions.register({ user: userData, password }));
    }
  }
}
