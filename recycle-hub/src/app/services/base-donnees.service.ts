import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseDonneesService {
  private nomBD = 'recycleHubDB';
  private version = 1;
  private bd: IDBDatabase | null = null;
  private estNavigateur: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.estNavigateur = isPlatformBrowser(this.platformId);
    if (this.estNavigateur) {
      this.initialiserBD().catch(console.error);
    }
  }

  private async initialiserBD(): Promise<void> {
    if (!this.estNavigateur || !window.indexedDB) {
      return;
    }

    return new Promise((resolve, reject) => {
      const requete = window.indexedDB.open(this.nomBD, this.version);

      requete.onerror = () => {
        console.error('Erreur d\'ouverture de la BD:', requete.error);
        reject(requete.error);
      };

      requete.onsuccess = () => {
        this.bd = requete.result;
        resolve();
      };

      requete.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const bd = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les collectes
        if (!bd.objectStoreNames.contains('collectes')) {
          const store = bd.createObjectStore('collectes', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
        }

        // Store pour la session utilisateur
        if (!bd.objectStoreNames.contains('session')) {
          bd.createObjectStore('session', { keyPath: 'id' });
        }

        // Store pour les utilisateurs
        if (!bd.objectStoreNames.contains('users')) {
          bd.createObjectStore('users', { keyPath: 'id' });
        }
      };
    });
  }

  creerMagasin(nomMagasin: string): Observable<void> {
    if (!this.estNavigateur) {
      return of(void 0);
    }

    return from(
      this.initialiserBD().then(() => {
        if (!this.bd) {
          throw new Error('Base de données non initialisée');
        }

        if (!this.bd.objectStoreNames.contains(nomMagasin)) {
          const version = this.bd.version + 1;
          this.bd.close();
          
          return new Promise<void>((resolve, reject) => {
            const requete = window.indexedDB.open(this.nomBD, version);

            requete.onerror = () => reject(requete.error);

            requete.onupgradeneeded = (event: IDBVersionChangeEvent) => {
              const bd = (event.target as IDBOpenDBRequest).result;
              bd.createObjectStore(nomMagasin, { keyPath: 'id' });
            };

            requete.onsuccess = () => {
              this.bd = requete.result;
              resolve();
            };
          });
        }
        return Promise.resolve();
      })
    ).pipe(
      catchError(error => {
        console.error(`Erreur lors de la création du magasin ${nomMagasin}:`, error);
        return of(void 0);
      })
    );
  }

  private getTransaction(nomMagasin: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return new Promise(async (resolve, reject) => {
      if (!this.bd) {
        try {
          await this.initialiserBD();
        } catch (error) {
          reject(error);
          return;
        }
      }

      if (!this.bd) {
        reject(new Error('Base de données non initialisée'));
        return;
      }

      try {
        const transaction = this.bd.transaction(nomMagasin, mode);
        const store = transaction.objectStore(nomMagasin);
        resolve(store);
      } catch (error) {
        reject(error);
      }
    });
  }

  recupererTout<T>(nomMagasin: string): Observable<T[]> {
    if (!this.estNavigateur) {
      return of([]);
    }

    return from(
      this.getTransaction(nomMagasin, 'readonly')
        .then(store => {
          return new Promise<T[]>((resolve, reject) => {
            const requete = store.getAll();
            requete.onsuccess = () => resolve(requete.result || []);
            requete.onerror = () => reject(requete.error);
          });
        })
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération:', error);
        return of([]);
      })
    );
  }

  ajouter<T>(nomMagasin: string, element: T): Observable<T> {
    if (!this.estNavigateur) {
      return of(element);
    }

    return from(
      this.getTransaction(nomMagasin, 'readwrite')
        .then(store => {
          return new Promise<T>((resolve, reject) => {
            const requete = store.add(element);
            requete.onsuccess = () => resolve(element);
            requete.onerror = () => reject(requete.error);
          });
        })
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'ajout:', error);
        return of(element);
      })
    );
  }

  mettreAJour<T>(nomMagasin: string, element: T): Observable<T> {
    if (!this.estNavigateur) {
      return of(element);
    }

    return from(
      this.getTransaction(nomMagasin, 'readwrite')
        .then(store => {
          return new Promise<T>((resolve, reject) => {
            const requete = store.put(element);
            requete.onsuccess = () => resolve(element);
            requete.onerror = () => reject(requete.error);
          });
        })
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour:', error);
        return of(element);
      })
    );
  }

  supprimer(nomMagasin: string, id: string): Observable<void> {
    if (!this.estNavigateur) {
      return of(void 0);
    }

    return from(
      this.getTransaction(nomMagasin, 'readwrite')
        .then(store => {
          return new Promise<void>((resolve, reject) => {
            const requete = store.delete(id);
            requete.onsuccess = () => resolve();
            requete.onerror = () => reject(requete.error);
          });
        })
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression:', error);
        return of(void 0);
      })
    );
  }
} 