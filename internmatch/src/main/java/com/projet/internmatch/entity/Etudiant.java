package com.projet.internmatch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
@DiscriminatorValue("Etudiant")
public class Etudiant extends Utilisateur {
    private Boolean etat ;
    private String niveau ;
    private String specialite ;
    private String cv ;
    private String faculte ;
    // Dans la classe Etudiant, ajouter :
    private String encadrantChoisi;       // format "Nom|email"
    private String statutEncadrant;       // EN_ATTENTE | ACCEPTE | REFUSE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    @JsonIgnore
    @ToString.Exclude
    private Institution institution;
    public Long getInstitutionId() {
        return institution != null ? institution.getId() : null;
    }
}
