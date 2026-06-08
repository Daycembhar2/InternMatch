import { Entreprise } from "./Entreprise.Entites";
import { Etudiant } from "./Etudiant.Entites";
import { Candidat } from "./Candidat.Entites";

export interface Offre {   // ← interface au lieu de class (plus courant pour DTO)
  id?: number;              // on enlève le ? car un id doit exister
  titre: string;
  description: string;
  type: string;
  datePublication?: Date;
  dateExpiration?: Date;
  time?: number;
  statutValidation?: string;
  image?:string;
  entreprise?: Entreprise;
  etudiant?: Etudiant;
  candidat?: Candidat;
  secteur?: string;
  // Ajout du champ localisation (très courant pour les offres)
  localisation?: string;           // ← ajoute ceci
  // ou si ton backend utilise un autre nom :
  // location?: string;
  // ville?: string;
  saved?: boolean;
  favori?: boolean; 
  // hatina des ? khatrhom optionelles yaani njmou nsstghnew aalihom
  categorie?: string;
  niveauCarriere?: string;
  nomentreprise?: string;
    etat?: boolean;  
}
