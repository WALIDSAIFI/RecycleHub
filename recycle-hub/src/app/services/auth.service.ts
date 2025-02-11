import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject, firstValueFrom } from 'rxjs';
import { delay, tap, switchMap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';
import { BaseDonneesService } from './base-donnees.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_STORE = 'session';
  private readonly USER_STORE = 'users';
  private readonly SESSION_ID = 'current-session';
  private readonly ADMIN_EMAIL = 'admin@recyclehub.com';
  private readonly ADMIN_PASSWORD = 'admin@recyclehub.com';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private store: Store,
    private bd: BaseDonneesService
  ) {
    this.initializeAuthState();
  }

  private async initializeAuthState() {
    try {
      // Attendre que la base de données soit prête
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Créer les magasins s'ils n'existent pas
      await firstValueFrom(this.bd.creerMagasin(this.USER_STORE));
      await firstValueFrom(this.bd.creerMagasin(this.SESSION_STORE));
      console.log('Magasins créés');

      // Vérifier la session existante
      const sessions = await firstValueFrom(this.bd.recupererTout<any>(this.SESSION_STORE));
      const currentSession = sessions.find(s => s.id === this.SESSION_ID);
      
      if (currentSession && currentSession.userId) {
        const users = await firstValueFrom(this.bd.recupererTout<User>(this.USER_STORE));
        const currentUser = users.find(u => u.id === currentSession.userId);
        if (currentUser) {
          this.currentUserSubject.next(currentUser);
          this.store.dispatch(AuthActions.loginSuccess({ user: currentUser }));
        }
      }

      // Vérifier si l'admin existe
      const users = await firstValueFrom(this.bd.recupererTout<User>(this.USER_STORE));
      console.log('Utilisateurs actuels:', users);

      const adminExists = users.some(user => user.email === this.ADMIN_EMAIL);
      console.log('Admin existe?', adminExists);

      if (!adminExists) {
        // Créer l'admin
        const adminUser: User = {
          id: 'admin',
          email: this.ADMIN_EMAIL,
          password: this.ADMIN_PASSWORD,
          firstName: 'Admin',
          lastName: 'RecycleHub',
          role: 'ADMIN',
          profileImage: null,
          address: '',
          city: '',
          postalCode: '',
          phone: '',
          birthDate: new Date().toISOString().split('T')[0]
        };

        console.log('Création de l\'admin...', adminUser);

        try {
          const createdAdmin = await firstValueFrom(this.bd.ajouter(this.USER_STORE, adminUser));
          console.log('Admin ajouté avec succès:', createdAdmin);
        } catch (error) {
          console.error('Erreur lors de la création de l\'admin:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      console.log('Tentative de continuer malgré l\'erreur...');
    }
  }

  private async resetDatabase() {
    try {
      // Supprimer les magasins existants
      try {
        await firstValueFrom(this.bd.creerMagasin(this.USER_STORE));
        const users = await firstValueFrom(this.bd.recupererTout<User>(this.USER_STORE));
        console.log('Utilisateurs à supprimer:', users);
        
        for (const user of users) {
          console.log('Suppression utilisateur:', user.id);
          await firstValueFrom(this.bd.supprimer(this.USER_STORE, user.id));
        }
        console.log('Tous les utilisateurs ont été supprimés');
      } catch (e) {
        console.log('Erreur lors du nettoyage USER_STORE:', e);
      }

      try {
        await firstValueFrom(this.bd.creerMagasin(this.SESSION_STORE));
        const sessions = await firstValueFrom(this.bd.recupererTout<any>(this.SESSION_STORE));
        console.log('Sessions à supprimer:', sessions);
        
        for (const session of sessions) {
          console.log('Suppression session:', session.id);
          await firstValueFrom(this.bd.supprimer(this.SESSION_STORE, session.id));
        }
        console.log('Toutes les sessions ont été supprimées');
      } catch (e) {
        console.log('Erreur lors du nettoyage SESSION_STORE:', e);
      }

      console.log('Base de données réinitialisée avec succès');
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la base de données:', error);
      return Promise.reject(error);
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => !!user)
    );
  }

  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user?.role === 'ADMIN')
    );
  }

  register(userData: any): Observable<User> {
    console.log('Données reçues pour l\'inscription:', {
      ...userData,
      password: userData.password ? '***' : undefined
    });

    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      console.error('Champs manquants:', {
        email: !!userData.email,
        password: !!userData.password,
        firstName: !!userData.firstName,
        lastName: !!userData.lastName
      });
      return throwError(() => new Error('Tous les champs obligatoires doivent être remplis'));
    }

    return this.bd.recupererTout<User>(this.USER_STORE).pipe(
      map(users => users.find(u => u.email === userData.email)),
      switchMap(existingUser => {
        if (existingUser) {
          console.error('Un utilisateur existe déjà avec cet email:', userData.email);
          return throwError(() => new Error('Un compte existe déjà avec cet email'));
        }

        const newUser: User = {
          id: 'user-' + Date.now(),
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          address: userData.address || '',
          city: userData.city || '',
          postalCode: userData.postalCode || '',
          phone: userData.phone || '',
          birthDate: userData.birthDate || new Date().toISOString().split('T')[0],
          profileImage: userData.profileImage || null,
          role: 'USER'
        };

        console.log('Création du nouvel utilisateur:', {
          ...newUser,
          password: '***'
        });

        return this.bd.ajouter(this.USER_STORE, newUser).pipe(
          tap(createdUser => console.log('Utilisateur créé avec succès:', {
            ...createdUser,
            password: '***'
          })),
          switchMap(createdUser => {
            const session = {
              id: this.SESSION_ID,
              userId: createdUser.id,
              timestamp: new Date().toISOString()
            };
            return this.bd.mettreAJour(this.SESSION_STORE, session).pipe(
              map(() => createdUser)
            );
          }),
          tap(user => {
            this.currentUserSubject.next(user);
            this.store.dispatch(AuthActions.registerSuccess({ user }));
          }),
          catchError(error => {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            return throwError(() => new Error('Erreur lors de la création du compte'));
          })
        );
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    console.log('Tentative de connexion avec:', { email });

    if (!email || !password) {
      console.error('Email ou mot de passe manquant');
      return throwError(() => new Error('Email and password are required'));
    }

    return this.bd.recupererTout<User>(this.USER_STORE).pipe(
      map(users => {
        const user = users.find(u => u.email === email);
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password');
        }
        return user;
      }),
      switchMap(user => {
        const session = {
          id: this.SESSION_ID,
          userId: user.id,
          timestamp: new Date().toISOString()
        };

        return this.bd.mettreAJour(this.SESSION_STORE, session).pipe(
          map(() => {
            this.currentUserSubject.next(user);
            this.store.dispatch(AuthActions.loginSuccess({ user }));
            return user;
          })
        );
      })
    );
  }

  logout(): Observable<void> {
    return this.bd.mettreAJour(this.SESSION_STORE, {
      id: this.SESSION_ID,
      userId: null,
      timestamp: new Date().toISOString()
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.store.dispatch(AuthActions.logout());
      }),
      map(() => void 0)
    );
  }

  removeCurrentUser(): void {
    this.currentUserSubject.next(null);
    this.bd.supprimer(this.SESSION_STORE, this.SESSION_ID).subscribe();
  }

  updateUser(user: User): Observable<User> {
    return this.bd.recupererTout<any>(this.USER_STORE).pipe(
      switchMap(users => {
        const index = users.findIndex(u => u.id === user.id);
        if (index === -1) {
          return throwError(() => new Error('User not found'));
        }
        
        return this.bd.mettreAJour(this.USER_STORE, user).pipe(
          switchMap(() => this.bd.mettreAJour(this.SESSION_STORE, {
            id: this.SESSION_ID,
            user: user
          }))
        );
      }),
      map(() => user),
      tap(updatedUser => {
        this.currentUserSubject.next(updatedUser);
        this.store.dispatch(AuthActions.loginSuccess({ user: updatedUser }));
      })
    );
  }
}