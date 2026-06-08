package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.entity.Offre;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OffreService {
    List<Offre> afficherOffres();
    List<Offre> getOffresParRole(String role);
    List<Offre> searchOffres(String query, String type, String localisation, String secteur); // ← modifié
    Offre ajouterOffre(Long entrepriseId, Offre offre);
    Offre getOffreById(Long id);
    Offre modifierOffre(Offre offre);
    Optional<Offre> afficheroffreById(Long id);
    List<Offre> getOffresByEntreprise(Long entrepriseId);
    Offre findById(Long offreId);
    void deleteOffre(Long id);
    List<Map<String, Object>> getCategoriesAvecCount();
    List<Offre> getOffresParEtudiant(Long etudiantId);
    List<Offre> getOffresParCandidat(Long candidatId);
    Offre updateOffre(Long id, Offre updatedOffre);
}