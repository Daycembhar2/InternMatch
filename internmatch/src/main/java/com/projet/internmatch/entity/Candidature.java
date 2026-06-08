package com.projet.internmatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "postulation")
public class Candidature {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "idcand")
        private Long id;

        private String cv;
        private String telephone;   // ← ajouter
        private String linkedin;

        @Lob
        @Column(name = "lettre_motivation", columnDefinition = "LONGTEXT")
        private String lettreMotivation;



        private String statut = "EN_ATTENTE";

        @Column(name = "statut_cand")
        private Boolean statutCand = false;

        @Temporal(TemporalType.TIMESTAMP)
        @Column(name = "date_postulation")
        private Date datePostulation = new Date();

        // ✅ AJOUT 1 — motifRefus
        // Quand l'institution refuse une candidature, elle doit préciser pourquoi.
        // Ce motif est sauvegardé en base ET inclus dans l'email envoyé à l'étudiant.
        // Sans ce champ, le refus serait anonyme et l'étudiant ne saurait pas la raison.
        @Column(name = "motif_refus")
        private String motifRefus;

        // ✅ AJOUT 2 — dateDecision
        // On enregistre la date exacte à laquelle l'institution a pris sa décision
        // (acceptation ou refus). Cela permet à l'institution de consulter l'historique
        // des décisions et à l'étudiant de savoir quand la décision a été prise.
        @Temporal(TemporalType.TIMESTAMP)
        @Column(name = "date_decision")
        private Date dateDecision;


        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "etudiant_id")
        private Etudiant etudiant;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "candidat_id")
        private Candidat candidat;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "offre_id")
        private Offre offre;
        @Column(name = "statut_institution")
        private String statutInstitution = "EN_ATTENTE";
        @Column(name = "note")
        private Integer note;

        @Column(name = "commentaire")
        private String commentaire;

}