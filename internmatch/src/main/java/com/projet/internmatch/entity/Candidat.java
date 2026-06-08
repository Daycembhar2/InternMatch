package com.projet.internmatch.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Data
@Entity
@DiscriminatorValue("Candidat")
public class Candidat extends Utilisateur {
    private String cv;
    private String competences;
    private String secteur;
}