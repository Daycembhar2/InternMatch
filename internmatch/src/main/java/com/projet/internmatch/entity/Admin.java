package com.projet.internmatch.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@DiscriminatorValue("ADMIN")
public class Admin extends Utilisateur {
    private String roleAdmin ;
}
