import { Etudiant } from './Etudiant.Entites';
import { Candidat } from './Candidat.Entites';
import { Offre } from './Offre.Entites';

export interface Postulation {
  id?: number;
  cv?: string;
  etudiant?: Etudiant;
  candidat?: Candidat;
  offre?: Offre;
}