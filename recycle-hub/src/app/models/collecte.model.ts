export interface Collecte {
  id: string;
  userId: string;
  dechets: {
    type: 'PLASTIQUE' | 'VERRE' | 'PAPIER' | 'METAL';
    poids: number;
  }[];
  poidsTotal: number;
  photos?: string[];
  adresse: string;
  dateCollecte: string;
  creneauHoraire: string;
  notes?: string;
  statut: 'EN_ATTENTE' | 'OCCUPEE' | 'EN_COURS' | 'VALIDEE' | 'REJETEE';
  dateCreation: string;
  collecteurId?: string;
} 