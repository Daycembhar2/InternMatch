package com.projet.internmatch.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.UUID;
@Data
@Entity
public class ConfirmationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="token_id")
    private Long tokenId;

    @Column(name="confirmation_token")
    private String confirmationToken;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @OneToOne(targetEntity = Etudiant.class, fetch = FetchType.LAZY,cascade = CascadeType.ALL,orphanRemoval = true)
    @JoinColumn(nullable = false, name = "etudiant_id")
    private Etudiant etudiant;

    public ConfirmationToken() {
    }
    public ConfirmationToken(Etudiant etudiant) {
        this.etudiant = etudiant;
        createdDate = new Date();
        confirmationToken = UUID.randomUUID().toString();
    }

}
