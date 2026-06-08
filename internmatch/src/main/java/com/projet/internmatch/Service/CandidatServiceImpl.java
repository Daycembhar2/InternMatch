package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.CandidatureRepository;
import com.projet.internmatch.entity.*;
import com.projet.internmatch.Repository.CandidatRepository;
import com.projet.internmatch.Repository.OffreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
@Service
public class CandidatServiceImpl implements CandidatService {
    @Autowired
    OffreRepository offreRepository;
    @Autowired
    CandidatRepository candidatRepository;
    @Autowired
    CandidatureRepository candidatureRepository;
    @Override
    public Utilisateur addUtilisateur(Utilisateur utilisateur) {
        return null;
    }

    @Override
    public Utilisateur authentifier(String email, String mdp) {
        return null;
    }


    @Override
    public List<Utilisateur> findAll() {
        return List.of();
    }

    @Override
    public Candidat updateProfil(Long candidatId, Candidat candidatDetails) {
        Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat not found"));

        candidat.setCv(candidatDetails.getCv());
        candidat.setCompetences(candidatDetails.getCompetences());

        return candidatRepository.save(candidat);
    }

    @Override
    public List<Offre> consulterOffresDisponibles() {
        return offreRepository
                .findByStatutValidationTrueAndDateExpirationAfter(new Date());
    }

    @Override
    public Candidature postulerOffre(Long candidatId, Long offreId) {
        Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat not found"));

        Offre offre = offreRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre not found"));

        if (!"VALIDEE".equals(offre.getStatutValidation())) {
            throw new RuntimeException("Offre non disponible ou non validée");
        }

        //  Vérifier si déjà postulé
        boolean exists = candidatureRepository.existsByCandidatIdAndOffreId(candidatId, offreId);
        if (exists) {
            throw new RuntimeException("Vous avez déjà postulé à cette offre");
        }

        Candidature candidature = new Candidature();
        candidature.setCandidat(candidat);
        candidature.setOffre(offre);
        candidature.setDatePostulation(new Date());
        candidature.setStatut("EN_ATTENTE");
        candidature.setStatutCand(false);

        return candidatureRepository.save(candidature);
    }
    @Override
    public List<Candidature> getMesCandidatures(Long candidatId) {
         return candidatureRepository.findByCandidatId(candidatId);
    }

    @Override
    public List<Offre> recommanderOffres(Long candidatId) {
        Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat not found"));

        // Simple logic: return available offers
        // (you can improve with skills matching later)
        return offreRepository
                .findByStatutValidationTrueAndDateExpirationAfter(new Date());
    }

    @Override
    public Candidat findById(Long candidatId) {
        return candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat not found with id: " + candidatId));
    }
}
