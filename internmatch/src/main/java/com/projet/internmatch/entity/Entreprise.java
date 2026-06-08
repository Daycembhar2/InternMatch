package com.projet.internmatch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.jspecify.annotations.Nullable;

import java.util.List;
@Entity
@Data
@DiscriminatorValue("Entreprise")
@ToString(exclude = {"offres"})
public class Entreprise extends Utilisateur {
    private String nomEntreprise;
    private String secteur ;
    @OneToMany(mappedBy = "entreprise" , cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Offre> offres ;
    private boolean etat ;


}
