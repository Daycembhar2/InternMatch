package com.projet.internmatch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@DiscriminatorValue("Institution")
public class Institution extends Utilisateur {

    private String nomFaculte;

    @OneToMany(mappedBy = "institution", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Etudiant> etudiants;

    // ✅ Stocké comme JSON string dans une seule colonne TEXT
    // Pas de table séparée, pas de converter externe
    @Lob
    @Column(name = "encadrants", columnDefinition = "LONGTEXT")
    private String encadrantsJson = "[]";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ✅ Getter : retourne la List<String> désérialisée depuis JSON
    @JsonProperty("encadrants")
    public List<String> getEncadrants() {
        if (encadrantsJson == null || encadrantsJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(encadrantsJson,
                    new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // ✅ Setter : sérialise la List<String> en JSON string
    public void setEncadrants(List<String> encadrants) {
        try {
            this.encadrantsJson = MAPPER.writeValueAsString(
                    encadrants == null ? new ArrayList<>() : encadrants
            );
        } catch (Exception e) {
            this.encadrantsJson = "[]";
        }
    }
}