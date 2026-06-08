package com.projet.internmatch.RestController;

import com.projet.internmatch.Repository.*;
import com.projet.internmatch.Service.EmailService;
import com.projet.internmatch.Service.OtpStore;
import com.projet.internmatch.entity.Candidat;
import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.Repository.CandidatureRepository;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Offre;
import com.projet.internmatch.Service.CandidatService;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(value="/candidat")
@CrossOrigin("*")
public class CandidatRestController {
    @Autowired
    EtudiantRepository etudiantRepository;
    @Autowired
    EntrepriseRepository entrepriseRepository;
    @Autowired
    InstitutionRepository institutionRepository;
    @Autowired
    AdminRepository  adminRepository;
    @Autowired
    CandidatRepository candidatRepository;
    @Autowired
    CandidatService candidatService;
    @Autowired
    CandidatureRepository candidatureRepository;
    @Autowired
    OffreRepository offreRepository;
    @Autowired
    EmailService emailService;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    private static final String RESET_SECRET = "a4d32l";
    private String generateResetToken(String email, String role) {
        long EXPIRATION_TIME = 15 * 60 * 1000;

        return Jwts.builder()
                .setSubject(email)
                .claim("purpose", "password_reset")
                .claim("role", role)              // ← AJOUT : rôle dans le token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS256, RESET_SECRET.getBytes())
                .compact();
    }
    @PostMapping("/forgotpassword")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        System.out.println("Requête forgotPassword reçue pour email: " + email);
        Map<String, Object> response = new HashMap<>();

        Candidat candidat = candidatRepository.findCandidatByEmail(email);
        if (candidat == null) {
            // Pour sécurité : on renvoie toujours "email envoyé" même si pas trouvé
            response.put("success", true);
            response.put("message", "Si l'email existe, un lien de réinitialisation a été envoyé.");
            return ResponseEntity.ok(response);
        }

        String resetToken = generateResetToken(email,"candidat");

        // Lien (adapte l'URL frontend selon ton domaine / port)
        String resetLink = "http://localhost:4200/resetpasswordwithtoken?token=" + resetToken;
        // En prod → "https://ton-app.com/reset-password?token=" + resetToken

        String subject = "InternMatch - Réinitialisation de mot de passe";
        String text = "Bonjour,\n\n" +
                "Cliquez sur ce lien pour réinitialiser votre mot de passe (valable 15 minutes) :\n" +
                resetLink + "\n\n" +
                "Si vous n'avez pas demandé cela, ignorez ce message.\n\n" +
                "Cordialement,\nL'équipe InternMatch";

        boolean emailSent = emailService.SendSimpleMessage(email, subject, text);

        if (emailSent) {
            response.put("success", true);
            response.put("message", "Lien de réinitialisation envoyé.");
            return ResponseEntity.ok(response);
        } else {
            // ✗ Si l'envoi échoue, retourner une erreur
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi de l'email. Veuillez vérifier votre email ou réessayer plus tard.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        Map<String, Object> response = new HashMap<>();

        try {
            // Parser et valider la signature + expiration
            Claims claims = Jwts.parser()
                    .setSigningKey(RESET_SECRET.getBytes())   // ← même format que signWith
                    .parseClaimsJws(token)
                    .getBody();

            // Vérifications supplémentaires
            String purpose = (String) claims.get("purpose");
            if (purpose == null || !purpose.equals("password_reset")) {
                throw new Exception("Token non destiné à la réinitialisation");
            }

            String email = claims.getSubject();
            if (claims.getExpiration().before(new Date())) {
                throw new Exception("Token expiré");
            }

            Candidat candidat = candidatRepository.findCandidatByEmail(email);
            if (candidat == null) {
                throw new Exception("Compte introuvable");
            }

            // Mise à jour mot de passe
            candidat.setMdp(bCryptPasswordEncoder.encode(newPassword));
            candidatRepository.save(candidat);

            response.put("success", true);
            response.put("message", "Mot de passe modifié avec succès !");
            return ResponseEntity.ok(response);

        } catch (ExpiredJwtException e) {
            response.put("success", false);
            response.put("message", "Lien expiré.");
            return ResponseEntity.badRequest().body(response);
        } catch (SignatureException e) {
            response.put("success", false);
            response.put("message", "Signature invalide.");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lien invalide : " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginCandidat(@RequestBody Candidat candidat) {
        System.out.println("in login-candidat"+candidat);
        HashMap<String, Object> response = new HashMap<>();

        Candidat userFromDB = candidatRepository.findCandidatByEmail(candidat.getEmail());
        System.out.println("userFromDB+candidat"+userFromDB);
        if (userFromDB == null) {
            response.put("message", "Candidat not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(candidat.getMdp(), (String) userFromDB.getMdp());
            System.out.println("compare"+compare);
            if (!compare) {
                response.put("message", "Password incorrect!");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }else
            {
                String token = Jwts.builder()
                        .claim("data", userFromDB)
                        .signWith(SignatureAlgorithm.HS256, "SECRET")
                        .compact();
                response.put("token", token);
                response.put("role", userFromDB.getRole());
                System.out.println("hhh");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }

        }
    }
    // 1. AJOUT D'UN CANDIDAT (ce qui manquait)
    @PostMapping
    public ResponseEntity<?> ajouterCandidat(@RequestBody Candidat candidat) {
        System.out.println("=== POST reçu pour Candidat ===");
        System.out.println("Email: " + candidat.getEmail());
        System.out.println("Nom: " + candidat.getNom());

        // Vérification unicité email (tous rôles)
        if (candidatRepository.existsByEmail(candidat.getEmail()) ||
                etudiantRepository.existsByEmail(candidat.getEmail()) ||
                entrepriseRepository.existsByEmail(candidat.getEmail()) ||
                institutionRepository.existsByEmail(candidat.getEmail()) ||
                adminRepository.existsByEmail(candidat.getEmail())) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cet email est déjà utilisé. Essayez de vous connecter."));
        }

        try {
            // On crée un nouvel objet pour être sûr du type exact (important avec l'héritage)
            Candidat newCandidat = new Candidat();
            newCandidat.setNom(candidat.getNom());
            newCandidat.setPrenom(candidat.getPrenom());
            newCandidat.setEmail(candidat.getEmail());

            // Hashage du mot de passe ICI (pas avant la vérification)
            newCandidat.setMdp(bCryptPasswordEncoder.encode(candidat.getMdp()));

            newCandidat.setCv(candidat.getCv());
            newCandidat.setCompetences(candidat.getCompetences());
            newCandidat.setSecteur(candidat.getSecteur());
            newCandidat.setRole("CANDIDAT");
            // Si tu as d'autres champs spécifiques à Candidat, ajoute-les ici

            Candidat saved = candidatRepository.save(newCandidat);

            System.out.println("=== CANDIDAT SAUVEGARDÉ ===");
            System.out.println("ID: " + saved.getId());
            System.out.println("Type: " + saved.getClass().getSimpleName());

            emailService.SendSimpleMessage(
                    saved.getEmail(),
                    "InternMatch — Bienvenue !",
                    "Bonjour " + saved.getNom() + ",\n\n" +
                            "Votre compte a été créé avec succès.\n" +
                            "Vous pouvez maintenant vous connecter sur InternMatch.\n\n" +
                            "Cordialement,\nL'équipe InternMatch"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
        catch (Exception e) {
            System.out.println("=== ERREUR LORS DE L'INSCRIPTION ===");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur lors de la création du compte : " + e.getMessage()));
        }
    }
    @GetMapping
    public ResponseEntity<List<Candidat>> getAllCandidats() {
        List<Candidat> candidats = candidatRepository.findAll();
        return ResponseEntity.ok(candidats);
    }
    @GetMapping("/emplois")
    public ResponseEntity<Map<String,Object>> consulterEmploi(){
        Set<String> jobTypes = Set.of("emploi","stage acdémique");
        List<Offre> offresEmploi = offreRepository.findByTypeIn(jobTypes);
        Map<String,Object> response = new HashMap<>();
        response.put("success",!offresEmploi.isEmpty());
        response.put("message", offresEmploi.isEmpty()
             ? "Aucune offre d'emploi disponible actuellement"
                : offresEmploi.size()+"offre(s) d'emploi trouvé(s)"
        );
        response.put("count",offresEmploi.size());
        response.put("emplois",offresEmploi);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/postuleremploi")
    ResponseEntity<Map<String,Object>> postulerEmploi(
            @RequestParam Long candidatId,
            @RequestParam Long offreId,
            @RequestBody(required = false) Map<String, String> body) {

        Candidat candidat = candidatRepository.findById(candidatId).orElse(null);
        if (candidat == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Candidat not found"));
        }

        Offre offre = offreRepository.findById(offreId).orElse(null);
        if (offre == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Offre non trouvée"));
        }

        String type = offre.getType() != null ? offre.getType().toLowerCase() : "";
        Set<String> jobTypes = Set.of("emploi", "stage");
        if (!jobTypes.contains(type)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "Cette offre n'est pas de type emploi (type reçu : " + offre.getType() + ")"
                    ));
        }

        // Vérifier si le candidat a déjà postulé à cette offre
        boolean dejaPostule = candidatureRepository.existsByCandidatAndOffre(candidat, offre);
        if (dejaPostule) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Vous avez déjà postulé à cette offre"));
        }

        Candidature candidature = new Candidature();
        candidature.setCandidat(candidat);   // ← objet Candidat, pas un Long
        candidature.setOffre(offre);          // ← objet Offre, pas un Long
        candidature.setDatePostulation(new Date());
        candidature.setCv(body != null ? body.getOrDefault("cv", "") : "");
        candidature.setLettreMotivation(body != null ? body.getOrDefault("message", "") : "");

        Candidature savedCandidature = candidatureRepository.save(candidature);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Candidature envoyée avec succès",
                "candidatureId", savedCandidature.getId()
        ));
    }
    @GetMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<?> getByEntreprise(@PathVariable Long entrepriseId) {
        List<Candidature> list = candidatureRepository.findByOffreEntrepriseId(entrepriseId);
        return ResponseEntity.ok(list);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Candidat> getById(@PathVariable Long id) {
        return candidatRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidat> updateCandidat(@PathVariable Long id,
                                                   @RequestBody Candidat updated) {
        return candidatRepository.findById(id).map(candidat -> {
            if (updated.getNom()             != null) candidat.setNom(updated.getNom());
            if (updated.getPrenom()          != null) candidat.setPrenom(updated.getPrenom());
            if (updated.getCompetences()     != null) candidat.setCompetences(updated.getCompetences());
            if (updated.getSecteur() != null) candidat.setSecteur(updated.getSecteur());
            if (updated.getTelephone()  != null) candidat.setTelephone(updated.getTelephone());
            return ResponseEntity.ok(candidatRepository.save(candidat));
        }).orElse(ResponseEntity.notFound().build());
    }
    @Autowired
    private OtpStore otpStore;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Candidat candidat = candidatRepository.findCandidatByEmail(email);
        if (candidat == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Email introuvable"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.save(email, otp);

        emailService.SendSimpleMessage(email,
                "InternMatch — Code de vérification",
                "Votre code : " + otp + "\n\nValable 10 minutes.");

        return ResponseEntity.ok(Map.of("message", "Code envoyé"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String email       = body.get("email");
        String otp         = body.get("otp");
        String newPassword = body.get("newPassword");

        if (!otpStore.verify(email, otp))
            return ResponseEntity.badRequest().body(Map.of("message", "Code incorrect ou expiré"));

        Candidat candidat = candidatRepository.findCandidatByEmail(email);
        if (candidat == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Utilisateur introuvable"));

        candidat.setMdp(new BCryptPasswordEncoder().encode(newPassword));
        candidatRepository.save(candidat);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}