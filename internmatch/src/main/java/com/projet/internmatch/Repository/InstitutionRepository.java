package com.projet.internmatch.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projet.internmatch.entity.Institution;

import java.util.List;

public interface InstitutionRepository extends JpaRepository<Institution, Long > {
    boolean existsByEmail(String email);

    Institution findInstitutionByEmail(String email);
    // ✅ AJOUT — findByNomFaculteContainingIgnoreCase
    // Permet l'autocomplétion : quand l'étudiant tape "isi" ou "ISI",
    // le système retourne toutes les institutions dont le nom contient ce texte.
    // "IgnoreCase" = insensible à la casse (majuscules/minuscules).
    // Spring Data JPA génère : WHERE LOWER(nom_faculte) LIKE LOWER('%isi%')
    List<Institution> findByNomFaculteContainingIgnoreCase(String nomFaculte);
}
