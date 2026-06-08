package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Offre;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface EtudiantService extends UtilisateurService {
    Etudiant postulerStage (Etudiant etudiant , Offre offre);
    List<Offre> consulterStage();
    List<Candidature>suivreCandidature (Etudiant etudiant);
    List<Offre>recevoirRecommandation (Etudiant etudiant);

    ResponseEntity<Object> save(Etudiant etudiant);
    ResponseEntity<?>confirmationemail(String confirmationemail);


    Etudiant findById(Long etudiantId);
}
