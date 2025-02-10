import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Collecte } from '../models/collecte.model';
import { BaseDonneesService } from './base-donnees.service';

@Injectable({
  providedIn: 'root'
})
export class CollecteService {
  private readonly NOM_MAGASIN = 'collectes';

  constructor(private bd: BaseDonneesService) {}

  getUserCollectes(userId: string): Observable<Collecte[]> {
    return this.bd.recupererTout<Collecte>(this.NOM_MAGASIN).pipe(
      map(collectes => collectes.filter(c => c.userId === userId)),
      catchError(error => {
        console.error('Erreur lors de la récupération des collectes:', error);
        return throwError(() => new Error('Impossible de récupérer vos collectes'));
      })
    );
  }

  addCollecte(collecte: Omit<Collecte, 'id' | 'dateCreation' | 'statut'>): Observable<Collecte> {
    return this.getUserCollectes(collecte.userId).pipe(
      switchMap(collectes => {
        const collectesEnCours = collectes.filter(c => 
          ['EN_ATTENTE', 'OCCUPEE', 'EN_COURS'].includes(c.statut)
        );

        if (collectesEnCours.length >= 3) {
          return throwError(() => new Error('Vous avez déjà 3 demandes en cours'));
        }

        if (collecte.poidsTotal > 10000) {
          throw new Error('Le poids total ne peut pas dépasser 10kg');
        }

        if (collecte.poidsTotal < 1000) {
          throw new Error('Le poids total doit être d\'au moins 1kg');
        }

        const nouvelleCollecte: Collecte = {
          ...collecte,
          id: 'collecte-' + Date.now(),
          dateCreation: new Date().toISOString(),
          statut: 'EN_ATTENTE'
        };

        return this.bd.ajouter(this.NOM_MAGASIN, nouvelleCollecte);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'ajout de la collecte:', error);
        return throwError(() => new Error('Impossible d\'ajouter la collecte'));
      })
    );
  }

  updateCollecte(collecteId: string, miseAJour: Partial<Collecte>): Observable<Collecte> {
    return this.getUserCollectes(miseAJour.userId || '').pipe(
      map(collectes => {
        const collecte = collectes.find(c => c.id === collecteId);
        if (!collecte) {
          throw new Error('Collecte non trouvée');
        }
        if (collecte.statut !== 'EN_ATTENTE') {
          throw new Error('Seules les collectes en attente peuvent être modifiées');
        }
        return { ...collecte, ...miseAJour };
      }),
      switchMap(collecteMiseAJour => this.bd.mettreAJour(this.NOM_MAGASIN, collecteMiseAJour))
    );
  }

  deleteCollecte(collecteId: string): Observable<void> {
    return this.getCollecteById(collecteId).pipe(
      switchMap(collecte => 
        this.getUserCollectes(collecte.userId).pipe(
          map(collectes => {
            const collecteTrouvee = collectes.find(c => c.id === collecteId);
            if (!collecteTrouvee) {
              throw new Error('Collecte non trouvée');
            }
            if (collecteTrouvee.statut !== 'EN_ATTENTE') {
              throw new Error('Seules les collectes en attente peuvent être supprimées');
            }
          }),
          switchMap(() => this.bd.supprimer(this.NOM_MAGASIN, collecteId))
        )
      )
    );
  }

  getCollecteById(id: string): Observable<Collecte> {
    return this.bd.recupererTout<Collecte>(this.NOM_MAGASIN).pipe(
      map(collectes => {
        const collecte = collectes.find(c => c.id === id);
        if (!collecte) {
          throw new Error('Collecte non trouvée');
        }
        return collecte;
      })
    );
  }

  getAllCollectes(): Observable<Collecte[]> {
    return this.bd.recupererTout<Collecte>(this.NOM_MAGASIN).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des collectes:', error);
        return throwError(() => new Error('Impossible de récupérer les collectes'));
      })
    );
  }
} 