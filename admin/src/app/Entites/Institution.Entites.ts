import { Utilisateur } from "./Utilisateur.Entites";

export class Institution extends Utilisateur{
    constructor(
        public override id?: number,
        public override nom?: string,
        public override prenom?: string,
        public override email?: string,
        public override mdp?: string,
        public override nomFaculte?: string,
    ) {
        super(id, nom, prenom, email, mdp, undefined, undefined, "institution", undefined, nomFaculte);
    }
}