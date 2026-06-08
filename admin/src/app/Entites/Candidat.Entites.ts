import { Utilisateur } from "./Utilisateur.Entites";

export class Candidat extends Utilisateur {
    constructor(
        public override id?: number,
        public override nom?: string,
        public override prenom?: string,
        public override email?: string,
        public override mdp?: string,
        public override cvCandidat?: string,
        public override competences?: string,
        public override secteur?: string  // ✅ remplace domaineRecherche
    ) {
        super(id, nom, prenom, email, mdp, undefined, undefined, "CANDIDAT", cvCandidat, undefined);
    }
}