package com.projet.internmatch.RestController;

import com.projet.internmatch.Repository.*;
import com.projet.internmatch.Service.EmailService;
import com.projet.internmatch.Service.OtpStore;
import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Offre;
import com.projet.internmatch.Service.EtudiantService;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.projet.internmatch.entity.Candidature;

import java.util.*;

@RestController
@RequestMapping(value = "/etudiant")
@CrossOrigin("*")
public class EtudiantRestController {
    @Autowired
    private OtpStore otpStore;
    @Autowired
    EtudiantRepository etudiantRepository;
    @Autowired
    EtudiantService etudiantService;
    @Autowired
    OffreRepository offreRepository ;
    @Autowired
    CandidatureRepository candidatureRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    CandidatRepository candidatRepository;
    @Autowired
    InstitutionRepository institutionRepository;
    @Autowired EntrepriseRepository entrepriseRepository;
    @Autowired AdminRepository adminRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    private static final String RESET_SECRET = "a4d32l";
    // APRÈS — on ajoute le paramètre "role"
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

        Etudiant etudiant = etudiantRepository.findEtudiantByEmail(email);
        if (etudiant == null) {
            // Pour sécurité : on renvoie toujours "email envoyé" même si pas trouvé
            response.put("success", true);
            response.put("message", "Si l'email existe, un lien de réinitialisation a été envoyé.");
            return ResponseEntity.ok(response);
        }

        String resetToken = generateResetToken(email, "etudiant");

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

            Etudiant etudiant = etudiantRepository.findEtudiantByEmail(email);
            if (etudiant == null) {
                throw new Exception("Compte introuvable");
            }

            // Mise à jour mot de passe
            etudiant.setMdp(bCryptPasswordEncoder.encode(newPassword));
            etudiantRepository.save(etudiant);

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
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Etudiant etudiant) {
        System.out.println("in login-etudiant"+etudiant);
        HashMap<String, Object> response = new HashMap<>();

        Etudiant userFromDB = etudiantRepository.findEtudiantByEmail(etudiant.getEmail());
        System.out.println("userFromDB+etudiant"+userFromDB);
        if (userFromDB == null) {
            response.put("message", "Etudiant not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(etudiant.getMdp(), (String) userFromDB.getMdp());
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
    // AJOUT D'UN ÉTUDIANT (ce qui manquait !)
    @PostMapping
    public ResponseEntity<?> ajouterEtudiant(@RequestBody Etudiant etudiant) {

        // ✅ Vérification cross-table
        if (etudiantRepository.existsByEmail(etudiant.getEmail()) ||
                candidatRepository.existsByEmail(etudiant.getEmail()) ||
                entrepriseRepository.existsByEmail(etudiant.getEmail()) ||
                institutionRepository.existsByEmail(etudiant.getEmail()) ||
                adminRepository.existsByEmail(etudiant.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cet email est déjà utilisé. Essayez de vous connecter."));
        }

        // ... le reste de ta logique existante (institutionId, fallback faculté, etc.)
        if (etudiant.getInstitutionId() != null) {
            institutionRepository.findById(etudiant.getInstitutionId())
                    .ifPresent(etudiant::setInstitution);
        } else if (etudiant.getFaculte() != null && !etudiant.getFaculte().isBlank()) {
            institutionRepository
                    .findByNomFaculteContainingIgnoreCase(etudiant.getFaculte().trim())
                    .stream()
                    .findFirst()
                    .ifPresent(etudiant::setInstitution);
        }

        return etudiantService.save(etudiant);
    }
    @GetMapping
    public ResponseEntity<List<Etudiant>> getAllEtudiants() {
        List<Etudiant> etudiants = etudiantRepository.findAll();  // ou etudiantService.findAll()
        return ResponseEntity.ok(etudiants);
    }
    @PostMapping("/postuler")
    ResponseEntity<?> PostulerStage(@RequestParam Long etudiantId, @RequestParam Long offreId,
                                    @RequestBody Map<String, String> requestBody) {

        Optional<Etudiant> etudiantOpt = etudiantRepository.findById(etudiantId);
        Optional<Offre> offreOpt = offreRepository.findById(offreId);

        if (etudiantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Étudiant non trouvé"));
        }
        if (offreOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Offre non trouvée"));
        }

        Etudiant etudiant = etudiantOpt.get();
        Offre offre = offreOpt.get();

        // ✅ Utiliser les méthodes correctes du repository
        boolean dejaPostule = candidatureRepository.existsByEtudiantAndOffre(etudiant, offre);
        if (dejaPostule) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Vous avez déjà postulé à cette offre"));
        }

        Candidature candidature = new Candidature();
        candidature.setEtudiant(etudiant);           // ✅ objet, pas Long
        candidature.setOffre(offre);                  // ✅ objet, pas Long
        candidature.setDatePostulation(new Date());   // ✅ nom correct
        candidature.setStatut("EN_ATTENTE");
        candidature.setStatutCand(false);


        candidature = candidatureRepository.save(candidature);
        etudiantService.postulerStage(etudiant, offre);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Candidature enregistrée avec succès",
                "candidatureId", candidature.getId(),
                "date", candidature.getDatePostulation()
        ));
    }
    @GetMapping("/stages")
    ResponseEntity<List<Offre>> getOffreStage(){
        List<Offre> stages = etudiantService.consulterStage();
        return ResponseEntity.ok(stages);
    }
    @RequestMapping(value="/confirm-account", method= {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> confirmCoachAccount(@RequestParam("token")String confirmationemail) {
        return etudiantService.confirmationemail(confirmationemail);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Etudiant> getById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Etudiant> updateEtudiant(@PathVariable Long id,
                                                   @RequestBody Etudiant updated) {
        return etudiantRepository.findById(id).map(etudiant -> {
            if (updated.getNom()        != null) etudiant.setNom(updated.getNom());
            if (updated.getPrenom()     != null) etudiant.setPrenom(updated.getPrenom());
            if (updated.getNiveau()     != null) etudiant.setNiveau(updated.getNiveau());
            if (updated.getSpecialite() != null) etudiant.setSpecialite(updated.getSpecialite());
            if (updated.getFaculte()    != null) etudiant.setFaculte(updated.getFaculte());
            if (updated.getTelephone()  != null) etudiant.setTelephone(updated.getTelephone());
            return ResponseEntity.ok(etudiantRepository.save(etudiant));
        }).orElse(ResponseEntity.notFound().build());
    }


    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Etudiant etudiant = etudiantRepository.findEtudiantByEmail(email);
        if (etudiant == null)
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

        Etudiant etudiant = etudiantRepository.findEtudiantByEmail(email);
        if (etudiant == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Utilisateur introuvable"));

        etudiant.setMdp(new BCryptPasswordEncoder().encode(newPassword));
        etudiantRepository.save(etudiant);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}
