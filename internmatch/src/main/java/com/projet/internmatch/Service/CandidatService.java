package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Candidat;
import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.entity.Offre;

import java.util.List;

public interface CandidatService extends UtilisateurService {
    // Gerer profil
    Candidat updateProfil(Long candidatId, Candidat candidat);

    // Consulter les offres disponibles
    List<Offre> consulterOffresDisponibles();

    // Postuler à une offre
    Candidature postulerOffre(Long candidatId, Long offreId);

    // Consulter ses candidatures
    List<Candidature> getMesCandidatures(Long candidatId);

    // Recevoir recommandations (simple version)
    List<Offre> recommanderOffres(Long candidatId);

    Candidat findById(Long candidatId);
}
