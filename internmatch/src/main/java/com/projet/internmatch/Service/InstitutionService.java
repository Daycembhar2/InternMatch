package com.projet.internmatch.Service;

import com.projet.internmatch.entity.*;
import java.util.List;
import java.util.Optional;

public interface InstitutionService extends UtilisateurService {

    // ── CRUD de base ──────────────────────────────────────────────
    Institution ajouterInstitution(Institution institution);
    List<Institution> getInstitution();
    void supprimerinstitution(Long id);
    Optional<Institution> afficherinstitutionbyid(Long id);

    // ── Étudiants de l'institution ────────────────────────────────
    // ✅ CORRIGÉ — remplace suivreEtudiant() qui retournait TOUS les étudiants
    // Maintenant filtrée par institutionId pour ne voir que ses propres étudiants
    List<Etudiant> getEtudiantsByInstitution(Long institutionId);

    // ── Candidatures des étudiants de l'institution ───────────────
    // L'institution accède aux offres UNIQUEMENT via les candidatures
    // de ses étudiants — pas directement via OffreRepository
    List<Candidature> getCandidaturesByInstitution(Long institutionId);

    // ── Validation des stages ─────────────────────────────────────
    // ✅ REMPLACE validerStage() qui était trop basique
    // accepterCandidature : change statut + génère PDF + envoie email
    Candidature accepterCandidature(Long candidatureId) throws Exception;

    // refuserCandidature : change statut + enregistre motif + envoie email
    Candidature refuserCandidature(Long candidatureId, String motif);

    // ── Génération PDF ────────────────────────────────────────────
    // ✅ CORRIGÉ — retourne byte[] au lieu de Institution (qui n'avait aucun sens)
    byte[] genererAttestation(Candidature candidature) throws Exception;
}