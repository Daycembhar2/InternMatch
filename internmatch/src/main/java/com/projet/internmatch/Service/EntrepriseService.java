package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.entity.Entreprise;
import com.projet.internmatch.entity.Utilisateur;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface EntrepriseService {

    // ✅ Uniquement ce qui concerne l'entreprise
    ResponseEntity<?> save(Entreprise entreprise);
    void supprimerentreprise(Long id);
    Optional<Entreprise> afficherentrepriseById(Long id);
    List<Candidature> consulterCandidature(Entreprise entreprise);
    Entreprise suivreWorkflow(Entreprise entreprise);

    // Hérité de Utilisateur
    Utilisateur addUtilisateur(Utilisateur utilisateur);
    Utilisateur authentifier(String email, String mdp);
    List<Utilisateur> findAll();

    // ❌ SUPPRIMÉ : publierOffre, modifierOffre, supprimerOffre
    //    → Ces méthodes appartiennent à OffreService
}