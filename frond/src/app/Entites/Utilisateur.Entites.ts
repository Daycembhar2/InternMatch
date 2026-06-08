export class Utilisateur {
  constructor(
    public id?: number,
    public nom?: string,
    public prenom?: string,
    public email?: string,
    public mdp?: string,
    public role?: string,
    public telephone?: string, // ← ajout ici
    // Champs spécifiques Étudiant
    public niveau?: string,
    public specialite?: string,
    public faculte?: string,
    public cvEtudiant?: string,
    // Champs spécifiques Candidat
    public competences?: string,
    public cvCandidat?: string,
    // Champs spécifiques Entreprise
    public nomEntreprise?: string,
    public secteur?: string,
    public listeOffres?: string,
    // Champs spécifiques Institution
    public nomFaculte?: string,
    // Champs spécifiques Admin
    public RoleAdmin?: string
  ) {}
}