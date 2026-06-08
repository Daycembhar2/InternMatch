package com.projet.internmatch.RestController;
import com.projet.internmatch.Service.OffreService;
import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.entity.Offre;
import jakarta.servlet.annotation.MultipartConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping(value="/offres")
@CrossOrigin("*")
@MultipartConfig(
        maxFileSize = 10485760,        // 10MB
        maxRequestSize = 52428800,     // 50MB
        fileSizeThreshold = 2097152    // 2MB
)
public class OffreRestController {
        @Autowired
        private OffreService offreService;

        // 1️⃣ Récupérer toutes les offres
        @GetMapping
        public List<Offre> afficherOffres() {
            return offreService.afficherOffres();
        }

        // 2️⃣ Récupérer les offres selon le rôle (ETUDIANT = STAGE, CANDIDAT = EMPLOI)
        @GetMapping("/role/{role}")
        public List<Offre> getOffresParRole(@PathVariable String role) {
            return offreService.getOffresParRole(role);
        }

    @GetMapping("/search")
    public ResponseEntity<List<Offre>> searchOffres(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String localisation,
            @RequestParam(required = false) String secteur) {
        List<Offre> results = offreService.searchOffres(query, type, localisation, secteur);
        return ResponseEntity.ok(results);
    }
    // afficher tous les offres
    @GetMapping("/{id}")
    public ResponseEntity<Offre> afficheroffreById(@PathVariable Long id) {
        return offreService.afficheroffreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // 7️⃣ Supprimer une offre
    @DeleteMapping("/{id}")
    public void deleteOffre(@PathVariable Long id) {
            offreService.deleteOffre(id);
        }
    @PostMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<Offre> createOffre(
            @PathVariable Long entrepriseId,
            @RequestPart("image") MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam("type") String type,
            @RequestParam("datePublication") @DateTimeFormat(pattern = "yyyy-MM-dd") Date datePublication,
            @RequestParam("dateExpiration") @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateExpiration,
            @RequestParam("description") String description,
            @RequestParam("time") int time,
            @RequestParam(value = "localisation", required = false) String localisation,
            @RequestParam(value = "secteur",      required = false) String secteur
            // ✅ niveauCarriere et nomentreprise supprimés
    ) {
        Offre offre = new Offre();
        offre.setTitre(titre);
        offre.setType(type);
        offre.setDatePublication(datePublication);
        offre.setDateExpiration(dateExpiration);
        offre.setDescription(description);
        offre.setTime(time);
        offre.setLocalisation(localisation);
        offre.setSecteur(secteur);
        offre.setStatutValidation("VALIDEE"); // ✅ statut par défaut

        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get("E:/PFE/frond/src/assets/images/uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            offre.setImage(fileName);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        Offre created = offreService.ajouterOffre(entrepriseId, offre);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/entreprise/{entrepriseId}")
    public List<Offre> getOffresByEntreprise(@PathVariable Long entrepriseId) {
        return offreService.getOffresByEntreprise(entrepriseId);
    }
    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        return offreService.getCategoriesAvecCount();
    }
    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<Offre>> getOffresParEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(offreService.getOffresParEtudiant(etudiantId));
    }

    @GetMapping("/candidat/{candidatId}")
    public ResponseEntity<List<Offre>> getOffresParCandidat(@PathVariable Long candidatId) {
        return ResponseEntity.ok(offreService.getOffresParCandidat(candidatId));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Offre> updateOffre(
            @PathVariable Long id,
            @RequestParam("titre") String titre,
            @RequestParam("type") String type,
            @RequestParam("dateExpiration") @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateExpiration,
            @RequestParam("description") String description,
            @RequestParam("time") int time,
            @RequestParam(value = "localisation", required = false) String localisation,
            @RequestParam(value = "secteur", required = false) String secteur,
            @RequestPart(value = "image", required = false) MultipartFile file  // ← optionnel en édition
    ) {
        Optional<Offre> existing = offreService.afficheroffreById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        Offre offre = existing.get();
        offre.setTitre(titre);
        offre.setType(type);
        offre.setDateExpiration(dateExpiration);
        offre.setDescription(description);
        offre.setTime(time);
        offre.setLocalisation(localisation);
        offre.setSecteur(secteur);

        // Image : ne remplacer que si une nouvelle est envoyée
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path path = Paths.get("E:/PFE/frond/src/assets/images/uploads/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());
                offre.setImage(fileName);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
        }

        Offre updated = offreService.updateOffre(id, offre);
        return ResponseEntity.ok(updated);
    }
    }


