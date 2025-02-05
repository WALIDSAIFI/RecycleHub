import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Charger l'utilisateur depuis localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(user);
    }
    return throwError(() => new Error('Email ou mot de passe incorrect'));
  }

  register(userData: Omit<User, 'id' | 'role' | 'points'>): Observable<User> {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Vérifier si l'email existe déjà
    if (users.some(u => u.email === userData.email)) {
      return throwError(() => new Error('Cet email est déjà utilisé'));
    }

    // Créer un nouvel utilisateur
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      role: 'particular',
      points: 0
    };

    // Ajouter à la liste des utilisateurs
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Connecter automatiquement
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);

    return of(newUser);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Ajouter quelques collecteurs par défaut
  initializeCollectors(): void {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.some(u => u.role === 'collector')) {
      const collectors: User[] = [
        {
          id: 'collector1',
          email: 'collector1@recycleHub.com',
          password: 'collector123',
          firstName: 'walid',
          lastName: 'saifi',
          address: '123 rue du Recyclage',
          city: 'Paris',
          postalCode: '75001',
          phone: '063255998',
          birthDate: '1999-07-02',
          role: 'collector',
          points: 0
        },
        
      ];

      users.push(...collectors);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
} 