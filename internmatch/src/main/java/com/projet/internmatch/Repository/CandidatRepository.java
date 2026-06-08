package com.projet.internmatch.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projet.internmatch.entity.Candidat;
public interface CandidatRepository extends JpaRepository<Candidat, Long> {
    boolean existsByEmail(String email);

    Candidat findCandidatByEmail(String email);
}
