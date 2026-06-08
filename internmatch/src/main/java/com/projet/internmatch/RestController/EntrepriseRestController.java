package com.projet.internmatch.RestController;

import com.projet.internmatch.Repository.*;
import com.projet.internmatch.Service.OffreService;
import com.projet.internmatch.Service.OtpStore;
import com.projet.internmatch.entity.*;
import com.projet.internmatch.Service.EmailService;
import com.projet.internmatch.Service.EntrepriseService;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(value = "/entreprise")
@CrossOrigin("*")
public class EntrepriseRestController {

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired EntrepriseRepository entrepriseRepository;
    @Autowired EntrepriseService entrepriseService;
    @Autowired EmailService emailService;
    @Autowired CandidatRepository candidatRepository;
    @Autowired EtudiantRepository etudiantRepository;
    @Autowired InstitutionRepository institutionRepository;
    @Autowired AdminRepository adminRepository;

    // ✅ Injecter OffreService pour gérer les offres
    @Autowired
    OffreService offreService;


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

        Entreprise entreprise = entrepriseRepository.findEntrepriseByEmail(email);
        if (entreprise == null) {
            // Pour sécurité : on renvoie toujours "email envoyé" même si pas trouvé
            response.put("success", true);
            response.put("message", "Si l'email existe, un lien de réinitialisation a été envoyé.");
            return ResponseEntity.ok(response);
        }

        String resetToken = generateResetToken(email,"entreprise");

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

            Entreprise entreprise = entrepriseRepository.findEntrepriseByEmail(email);
            if (entreprise == null) {
                throw new Exception("Compte introuvable");
            }

            // Mise à jour mot de passe
            entreprise.setMdp(bCryptPasswordEncoder.encode(newPassword));
            entrepriseRepository.save(entreprise);

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

    // ── Inscription ───────────────────────────────────────────────
    @PostMapping
    ResponseEntity<?> AddEntreprise(@RequestBody Entreprise entreprise) {
        HashMap<String, Object> response = new HashMap<>();
        System.out.println(">>> MDP reçu : " + entreprise.getMdp());
        //  Vérification cross-table
        if (entrepriseRepository.existsByEmail(entreprise.getEmail()) ||
                etudiantRepository.existsByEmail(entreprise.getEmail()) ||
                candidatRepository.existsByEmail(entreprise.getEmail()) ||
                institutionRepository.existsByEmail(entreprise.getEmail()) ||
                adminRepository.existsByEmail(entreprise.getEmail())) {
            response.put("message", "Cet email est déjà utilisé. Essayez de vous connecter.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        entreprise.setMdp(bCryptPasswordEncoder.encode(entreprise.getMdp()));
        Entreprise saved = entrepriseRepository.save(entreprise);

        String subject = "Bienvenue - Vérification de votre compte";
        String text = "Votre compte entreprise a été créé avec succès !\n\n"
                + "Email: " + saved.getEmail() + "\n"
                + "Nom: " + saved.getNom() + "\n\n"
                + "Veuillez attendre la validation de votre compte par l'administrateur.";
        emailService.SendSimpleMessage(saved.getEmail(), subject, text);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    // ── Login ─────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginEntreprise(@RequestBody Entreprise entreprise) {
        HashMap<String, Object> response = new HashMap<>();
        Entreprise userFromDB = entrepriseRepository.findEntrepriseByEmail(entreprise.getEmail());

        if (userFromDB == null) {
            response.put("message", "Entreprise not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        boolean match = bCryptPasswordEncoder.matches(entreprise.getMdp(), userFromDB.getMdp());
        if (!match) {
            response.put("message", "Password incorrect!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!userFromDB.isEtat()) {
            response.put("message", "Compte non encore validé par l'administrateur.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        String token = Jwts.builder()
                .claim("data", userFromDB)
                .signWith(SignatureAlgorithm.HS256, "SECRET")
                .compact();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    // ── CRUD Entreprise ───────────────────────────────────────────
    @GetMapping
    public List<Entreprise> getAllEntreprises() {
        return entrepriseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entreprise> getEntrepriseById(@PathVariable Long id) {
        return entrepriseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public void supprimerEntreprise(@PathVariable Long id) {
        entrepriseService.supprimerentreprise(id);
    }

    @PutMapping("/updateetat/{id}")
    public Entreprise modifierEntreprise(@RequestBody Entreprise entreprise,
                                         @PathVariable Long id) {
        Entreprise existing = entrepriseRepository.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setNomEntreprise(entreprise.getNomEntreprise());
        existing.setSecteur(entreprise.getSecteur());
        existing.setEmail(entreprise.getEmail());

        // ✅ Only re-hash if a new password was explicitly sent
        if (entreprise.getMdp() != null && !entreprise.getMdp().isBlank()
                && !entreprise.getMdp().startsWith("$2a$")) {  // not already a bcrypt hash
            existing.setMdp(bCryptPasswordEncoder.encode(entreprise.getMdp()));
        }

        if (entreprise.isEtat() != existing.isEtat()) {
            String etat = entreprise.isEtat() ? "Accepté" : "Bloqué";  // ✅ fixed logic too
            emailService.SendSimpleMessage(existing.getEmail(),          // ✅ use existing email
                    "L'état de votre compte", "Votre compte a été " + etat);
        }
        existing.setEtat(entreprise.isEtat());
        return entrepriseRepository.save(existing);
    }

    // ── Offres — délégué à OffreService ──────────────────────────

    // ✅ Publier une offre via OffreService
    @PostMapping("/offre")
    ResponseEntity<?> publierOffre(@RequestBody Offre offre,
                                   @RequestParam Long entrepriseid) {
        HashMap<String, Object> response = new HashMap<>();
        Optional<Entreprise> entrepriseOpt = entrepriseRepository.findById(entrepriseid);

        if (entrepriseOpt.isEmpty()) {
            response.put("message", "Entreprise introuvable !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // ✅ Déléguer à OffreService
        offre.setEntreprise(entrepriseOpt.get());
        Offre saved = offreService.ajouterOffre(entrepriseid, offre);
        response.put("message", "Offre publiée avec succès !");
        response.put("offre", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ✅ Modifier une offre via OffreService
    @PutMapping("/offre/{idoffre}")
    public ResponseEntity<?> modifierOffre(@PathVariable Long idoffre,
                                           @RequestBody Offre offre) {
        offre.setId(idoffre);
        // ✅ Déléguer à OffreService
        Offre updated = offreService.modifierOffre(offre);
        return ResponseEntity.ok(updated);
    }

    // ✅ Supprimer une offre via OffreService
    @DeleteMapping("/offre/{idoffre}")
    public void supprimerOffre(@PathVariable Long idoffre) {
        // ✅ Déléguer à OffreService
        offreService.deleteOffre(idoffre);
    }

    // ── Candidatures ─────────────────────────────────────────────
    @GetMapping("/candidatures")
    ResponseEntity<List<Candidature>> consulterCandidature(@RequestParam Long entrepriseId) {
        return entrepriseRepository.findById(entrepriseId)
                .map(e -> ResponseEntity.ok(entrepriseService.consulterCandidature(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/workflow")
    ResponseEntity<Object> suivreWorkflow(@RequestParam Long entrepriseId) {
        return entrepriseRepository.findById(entrepriseId)
                .map(e -> ResponseEntity.ok((Object) entrepriseService.suivreWorkflow(e)))
                .orElse(ResponseEntity.notFound().build());
    }
    @Autowired
    private OtpStore otpStore;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Entreprise entreprise = entrepriseRepository.findEntrepriseByEmail(email);
        if (entreprise == null)
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

        Entreprise entreprise = entrepriseRepository.findEntrepriseByEmail(email);
        if (entreprise == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Utilisateur introuvable"));

        entreprise.setMdp(new BCryptPasswordEncoder().encode(newPassword));
        entrepriseRepository.save(entreprise);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}
