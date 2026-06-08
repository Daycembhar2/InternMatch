package com.projet.internmatch.RestController;

import com.projet.internmatch.Repository.CandidatureRepository;
import com.projet.internmatch.Service.*;
import com.projet.internmatch.entity.Candidat;
import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Offre;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/postulation")
@CrossOrigin("*")
public class CandidatureRestController {

    @Autowired
    private CandidatureService candidatureService;
    @Autowired
    private EtudiantService etudiantService;
    @Autowired
    private CandidatService candidatService;
    @Autowired
    private OffreService offreService;
    @Autowired
    private CandidatureRepository candidatureRepository;
    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<Candidature>> getAllPostulations() {
        return ResponseEntity.ok(candidatureService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidature> getPostulationById(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.findById(id));
    }

    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<Candidature>> getByEtudiantId(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(candidatureService.findByEtudiantId(etudiantId));
    }

    @GetMapping("/offre/{offreId}")
    public ResponseEntity<List<Candidature>> getByOffreId(@PathVariable Long offreId) {
        return ResponseEntity.ok(candidatureService.findByOffreId(offreId));
    }

    @GetMapping("/candidat/{candidatId}")
    public ResponseEntity<List<Candidature>> getByCandidatId(@PathVariable Long candidatId) {
        return ResponseEntity.ok(candidatureService.findByCandidatId(candidatId));
    }

    @PostMapping(value = "/{offreId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postuler(
            @PathVariable Long offreId,
            @RequestPart("cv") MultipartFile cvFile,
            @RequestParam("lettreMotivation") String lettreMotivation,
            @RequestParam(value = "telephone", required = false) String telephone,
            @RequestParam(value = "linkedin",  required = false) String linkedin,
            @RequestParam(value = "etudiantId", required = false) String etudiantIdStr,
            @RequestParam(value = "candidatId", required = false) String candidatIdStr
    ) {
        System.out.println("=== POSTULATION REÇUE ===");
        System.out.println("offreId: "    + offreId);
        System.out.println("etudiantId: " + etudiantIdStr);
        System.out.println("candidatId: " + candidatIdStr);

        if (cvFile == null || cvFile.isEmpty()) {
            return ResponseEntity.badRequest().body("CV manquant");
        }

        Candidature postulation = new Candidature();

        // Upload CV
        try {
            String fileName = System.currentTimeMillis() + "_" + cvFile.getOriginalFilename();
            Path uploadPath = Paths.get("E:/PFE/frond/src/assets/cv/uploads/" + fileName);
            Files.createDirectories(uploadPath.getParent());
            Files.write(uploadPath, cvFile.getBytes());
            postulation.setCv(fileName);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur upload CV: " + e.getMessage());
        }

        postulation.setLettreMotivation(lettreMotivation);
        postulation.setTelephone(telephone);  // ← champ ajouté
        postulation.setLinkedin(linkedin);    // ← champ ajouté
        postulation.setDatePostulation(new Date());

        // Liaison Etudiant ou Candidat
        if (etudiantIdStr != null && !etudiantIdStr.trim().isEmpty()) {
            try {
                Etudiant etudiant = etudiantService.findById(Long.parseLong(etudiantIdStr));
                postulation.setEtudiant(etudiant);
                System.out.println("✅ Étudiant trouvé : " + etudiant.getNom());
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Erreur étudiant: " + e.getMessage());
            }
        } else if (candidatIdStr != null && !candidatIdStr.trim().isEmpty()) {
            try {
                Candidat candidat = candidatService.findById(Long.parseLong(candidatIdStr));
                postulation.setCandidat(candidat);
                System.out.println("✅ Candidat trouvé : " + candidat.getNom());
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Erreur candidat: " + e.getMessage());
            }
        } else {
            return ResponseEntity.badRequest().body("etudiantId ou candidatId requis");
        }

        try {
            postulation.setOffre(offreService.findById(offreId));
            Candidature saved = candidatureService.save(postulation);
            System.out.println("✅ Postulation sauvegardée id=" + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur sauvegarde: " + e.getMessage());
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidature> updatePostulation(@PathVariable Long id, @RequestBody Candidature postulation) {
        postulation.setId(id);
        return ResponseEntity.ok(candidatureService.save(postulation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePostulation(@PathVariable Long id) {
        candidatureService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> changerStatut(
            @PathVariable Long id,
            @RequestParam String statut) {

        Candidature c = candidatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        c.setStatut(statut); // "ACCEPTE" ou "REFUSE"
        c.setStatutCand(statut.equals("ACCEPTE"));
        candidatureRepository.save(c);

        // Email de notification
        String email = null;
        String prenom = null;
        if (c.getEtudiant() != null) {
            email = c.getEtudiant().getEmail();
            prenom = c.getEtudiant().getPrenom();
        } else if (c.getCandidat() != null) {
            email = c.getCandidat().getEmail();
            prenom = c.getCandidat().getPrenom();
        }

        if (email != null) {
            String msg = "Bonjour " + prenom + ",\n\nVotre candidature pour \""
                    + c.getOffre().getTitre() + "\" a été "
                    + (statut.equals("ACCEPTE") ? "acceptée." : "refusée.")
                    + "\n\nCordialement,\nInternMatch";
            emailService.SendSimpleMessage(email, "Mise à jour de votre candidature", msg);
        }

        return ResponseEntity.ok(c);
    }
    @GetMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<?> getByEntreprise(@PathVariable Long entrepriseId) {
        List<Candidature> list = candidatureRepository.findByOffreEntrepriseId(entrepriseId);
        return ResponseEntity.ok(list);
    }
    //Enregistrement
    @PutMapping("/{id}/feedback")
    public ResponseEntity<?> donnerFeedback(@PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        return candidatureRepository.findById(id).map(c -> {
            c.setNote((Integer) body.get("note"));
            c.setCommentaire((String) body.get("commentaire"));
            return ResponseEntity.ok(candidatureRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
    //Récupération
    @GetMapping("/offre/{offreId}/feedbacks")
    public ResponseEntity<List<Map<String, Object>>> getFeedbacksOffre(
            @PathVariable Long offreId) {

        List<Candidature> candidatures = candidatureRepository
                .findByOffreIdAndNoteIsNotNull(offreId);

        List<Map<String, Object>> feedbacks = candidatures.stream()
                .map(c -> {
                    Map<String, Object> fb = new HashMap<>();
                    fb.put("note", c.getNote());
                    fb.put("commentaire", c.getCommentaire());

                    // Nom anonymisé ex: "D. Ben Salem"
                    String auteur = "Anonyme";
                    if (c.getEtudiant() != null) {
                        auteur = c.getEtudiant().getPrenom().charAt(0)
                                + ". " + c.getEtudiant().getNom();
                    } else if (c.getCandidat() != null) {
                        auteur = c.getCandidat().getPrenom().charAt(0)
                                + ". " + c.getCandidat().getNom();
                    }
                    fb.put("auteur", auteur);
                    return fb;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(feedbacks);
    }

}