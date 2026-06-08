package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import com.projet.internmatch.entity.Etudiant;

import java.util.List;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    boolean existsByEmail(String email);

    // ✅ Spring Data dérive automatiquement : WHERE institution_id = ?
    List<Etudiant> findByInstitution_Id(Long institutionId);

    List<Etudiant> findByInstitution(Institution institution);
    Etudiant findEtudiantByEmail(String email);
}