package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Candidat;
import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Offre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findByCandidatId(Long candidatId);
    List<Candidature> findByOffreId(Long offreId);
    List<Candidature> findByEtudiantId(Long etudiantId);
    List<Candidature> findByOffreEntrepriseId(Long entrepriseId);
    boolean existsByCandidatAndOffre(Candidat candidat, Offre offre);
    boolean existsByEtudiantAndOffre(Etudiant etudiant, Offre offre);          // ✅ pour EtudiantController
    boolean existsByCandidatIdAndOffreId(Long candidatId, Long offreId);       // ✅ pour CandidatService
    // ✅ AJOUT — findByEtudiantInstitutionId
    // Permet à l'institution de récupérer TOUTES les candidatures
    // des étudiants qui lui appartiennent, en filtrant par institution_id.
    // Spring Data JPA génère automatiquement la requête SQL à partir du nom
    // de la méthode : JOIN etudiant → JOIN institution → WHERE institution.id = ?
    List<Candidature> findByEtudiant_Institution_Id(Long institutionId);
    List<Candidature> findByOffreIdAndNoteIsNotNull(Long offreId);
    // ← ajouter
    boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId);

}

