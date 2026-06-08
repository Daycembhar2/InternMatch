package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<Offre, Long> {

    @Query("SELECT o FROM Offre o WHERE " +
            "(o.statutValidation IS NULL OR LOWER(o.statutValidation) = 'validee') AND " +
            "(:query IS NULL OR " +
            "LOWER(o.titre) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(o.type) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(o.secteur) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(o.localisation) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:type IS NULL OR LOWER(o.type) LIKE LOWER(CONCAT('%', :type, '%'))) " +
            "AND (:localisation IS NULL OR LOWER(o.localisation) LIKE LOWER(CONCAT('%', :localisation, '%'))) " +
            "AND (:secteur IS NULL OR LOWER(o.secteur) LIKE LOWER(CONCAT('%', :secteur, '%'))) " +
            "ORDER BY o.datePublication DESC")
    List<Offre> searchOffres(@Param("query") String query,
                             @Param("type") String type,
                             @Param("localisation") String localisation,
                             @Param("secteur") String secteur);
    List<Offre> findByEntrepriseId(Long entrepriseId);
    List<Offre> findByTypeIn(Collection<String> types);
    List<Offre> findByStatutValidation(String statutValidation);
    // ✅ Ajouté — utilisé dans CandidatServiceImpl
    List<Offre> findByStatutValidationTrueAndDateExpirationAfter(Date date);
    @Query("SELECT o.type, COUNT(o) FROM Offre o GROUP BY o.type")
    List<Object[]> countOffresByType();
    List<Offre> findByEntrepriseIdAndStatutValidation(Long entrepriseId, String statut);
    List<Offre> findByStatutValidationAndType(String statutValidation, String type);
}