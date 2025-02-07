import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'currentUser';
  private storage: Storage | null = null;

  constructor(private store: Store) {
    if (typeof window !== 'undefined') {
      this.storage = window.localStorage;
      this.initializeAuthState();
    }
  }

  private initializeAuthState() {
    const user = this.getCurrentUser();
    if (user) {
      this.store.dispatch(AuthActions.loginSuccess({ user }));
    }
  }

  getCurrentUser(): User | null {
    try {
      if (!this.storage) return null;
      const userStr = this.storage.getItem(this.USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User): void {
    try {
      if (!this.storage) return;
      this.storage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  removeCurrentUser(): void {
    try {
      if (!this.storage) return;
      this.storage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  register(userData: any): Observable<User> {
    return of({
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address,
      city: userData.city,
      postalCode: userData.postalCode,
      phone: userData.phone,
      birthDate: userData.birthDate,
      profileImage: userData.profileImage,
      password: '',
      role: 'USER'
    } as User).pipe(
      delay(1000),
      tap(user => {
        this.setCurrentUser(user);
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return of({
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      firstName: 'Test',
      lastName: 'User',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      birthDate: new Date().toISOString().split('T')[0],
      password: '',
      role: 'USER',
      profileImage: null
    } as User).pipe(
      delay(1000),
      tap(user => {
        this.setCurrentUser(user);
      })
    );
  }
}