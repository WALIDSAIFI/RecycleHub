import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Collecte } from '../models/collecte.model';

@Injectable({
  providedIn: 'root'
})
export class CollecteService {
  private readonly COLLECTES_KEY = 'collectes';
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  private getCollectes(): Collecte[] {
    const collectesStr = this.storage.getItem(this.COLLECTES_KEY);
    return collectesStr ? JSON.parse(collectesStr) : [];
  }

  private saveCollectes(collectes: Collecte[]): void {
    this.storage.setItem(this.COLLECTES_KEY, JSON.stringify(collectes));
  }

  addCollecte(collecte: Omit<Collecte, 'id' | 'dateCreation' | 'statut'>): Observable<Collecte> {
    const collectes = this.getCollectes();
    const userCollectes = collectes.filter(c => c.userId === collecte.userId && 
      ['EN_ATTENTE', 'OCCUPEE', 'EN_COURS'].includes(c.statut));

    // Vérifier le nombre maximum de demandes en cours
    if (userCollectes.length >= 3) {
      return throwError(() => new Error('Vous avez déjà 3 demandes en cours'));
    }

    // Vérifier le poids total
    if (collecte.poidsTotal > 10000) { // 10kg en grammes
      return throwError(() => new Error('Le poids total ne peut pas dépasser 10kg'));
    }

    // Vérifier le poids minimum
    if (collecte.poidsTotal < 1000) { // 1kg en grammes
      return throwError(() => new Error('Le poids total doit être d\'au moins 1kg'));
    }

    const newCollecte: Collecte = {
      ...collecte,
      id: 'collecte-' + Date.now(),
      dateCreation: new Date().toISOString(),
      statut: 'EN_ATTENTE'
    };

    collectes.push(newCollecte);
    this.saveCollectes(collectes);

    return of(newCollecte);
  }

  getUserCollectes(userId: string): Observable<Collecte[]> {
    const collectes = this.getCollectes();
    return of(collectes.filter(c => c.userId === userId));
  }

  updateCollecte(collecteId: string, updates: Partial<Collecte>): Observable<Collecte> {
    const collectes = this.getCollectes();
    const index = collectes.findIndex(c => c.id === collecteId);
    
    if (index === -1) {
      return throwError(() => new Error('Collecte non trouvée'));
    }

    const collecte = collectes[index];
    if (collecte.statut !== 'EN_ATTENTE') {
      return throwError(() => new Error('Seules les collectes en attente peuvent être modifiées'));
    }

    collectes[index] = { ...collecte, ...updates };
    this.saveCollectes(collectes);

    return of(collectes[index]);
  }

  deleteCollecte(collecteId: string): Observable<void> {
    const collectes = this.getCollectes();
    const index = collectes.findIndex(c => c.id === collecteId);
    
    if (index === -1) {
      return throwError(() => new Error('Collecte non trouvée'));
    }

    const collecte = collectes[index];
    if (collecte.statut !== 'EN_ATTENTE') {
      return throwError(() => new Error('Seules les collectes en attente peuvent être supprimées'));
    }

    collectes.splice(index, 1);
    this.saveCollectes(collectes);

    return of(void 0);
  }

  getCollecteById(id: string): Observable<Collecte> {
    const collectes = this.getCollectes();
    const collecte = collectes.find(c => c.id === id);
    
    if (!collecte) {
      return throwError(() => new Error('Collecte non trouvée'));
    }
    
    return of(collecte);
  }
} 