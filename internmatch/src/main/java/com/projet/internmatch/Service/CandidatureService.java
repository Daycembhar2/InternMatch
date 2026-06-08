package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Candidature;

import java.util.List;

public interface CandidatureService {
    List<Candidature> findAll();
    Candidature findById(Long id);
    List<Candidature> findByEtudiantId(Long etudiantId);
    List<Candidature> findByOffreId(Long offreId);
    List<Candidature> findByCandidatId(Long candidatId);
    Candidature save(Candidature postulation);  // ← une seule signature correcte
    void deleteById(Long id);
    boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId);
    boolean existsByCandidatIdAndOffreId(Long candidatId, Long offreId);
}