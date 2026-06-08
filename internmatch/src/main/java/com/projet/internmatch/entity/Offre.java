package com.projet.internmatch.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;


import java.util.Date;
import java.util.List;

@Entity
@Data
@ToString(exclude = "entreprise")
public class Offre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_offre")
    private Long id;
    private String titre;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    private String type;
    private String localisation;
    private String secteur;        // yaani fel informatique wele finance
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date datePublication;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date dateExpiration;
    private int time;
    private String statutValidation; //Acceptée , réfusé ou bien en attente
    @ManyToOne
    @JoinColumn(name = "entrepriseId")
    private Entreprise entreprise;
    @Lob
    private String image;

    public boolean estExpire() {
        if (dateExpiration == null) return false;
        return new Date().after(dateExpiration);
    }

    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Candidature> postulations;
}