import { Utilisateur } from "./Utilisateur.Entites";

export class Etudiant extends Utilisateur{
    constructor(
        public override id?: number,
        public override nom?: string,
        public override prenom?: string,
        public override email?: string,
        public override mdp?: string,
        public override niveau?: string,
        public override specialite?: string,
        public override cvEtudiant?: string,
        public override faculte?: string
    ) {
        super(id, nom, prenom, email, mdp,niveau,specialite,"etudiant",cvEtudiant,faculte);
    }
}