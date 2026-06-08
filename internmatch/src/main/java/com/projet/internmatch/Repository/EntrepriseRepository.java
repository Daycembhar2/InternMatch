package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    boolean existsByEmail(String email);

    // Remplace ou ajoute cette méthode
    @Query("SELECT e FROM Entreprise e LEFT JOIN FETCH e.offres")
    List<Entreprise> findAllWithOffres();
    Entreprise findEntrepriseByEmail(String email);
}
