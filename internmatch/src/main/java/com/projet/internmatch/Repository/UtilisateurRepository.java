package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
     //long countByDtype(String dtype);

    boolean existsByEmail(String email);

    Utilisateur findByEmail(String email);
}
