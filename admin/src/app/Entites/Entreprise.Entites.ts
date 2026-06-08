import { Utilisateur } from "./Utilisateur.Entites";
import { Offre } from "./Offre.Entites";


export class Entreprise extends Utilisateur{
    constructor(
        public override id?: number,
        public override nom?: string,
        public override prenom?: string,
        public override email?: string,
        public override mdp?: string,
        public override nomEntreprise?: string,
        public override secteur?: string,
        public offres?: Offre[],
        public etat = true
    ) {
        super(id, nom, prenom, email, mdp, undefined, undefined, "entreprise", undefined, nomEntreprise);
    }
}