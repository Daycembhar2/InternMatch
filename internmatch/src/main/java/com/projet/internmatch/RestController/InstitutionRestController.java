package com.projet.internmatch.RestController;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projet.internmatch.Repository.*;
import com.projet.internmatch.Service.EmailService;
import com.projet.internmatch.Service.InstitutionService;
import com.projet.internmatch.Service.OtpStore;
import com.projet.internmatch.entity.Candidature;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Institution;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping(value = "/institution")
@CrossOrigin("*")
public class InstitutionRestController {
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    // Ta clé secrète (doit être la même que pour l'authentification normale !)
    private static final String RESET_SECRET = "a4d32l"; // ← mets la même que pour login si possible
    @Autowired
    CandidatRepository candidatRepository;
    @Autowired
    EntrepriseRepository entrepriseRepository;
    @Autowired
    EtudiantRepository etudiantRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    InstitutionRepository institutionRepository;
    @Autowired
    InstitutionService institutionService;
    @Autowired
    AdminRepository adminRepository;
    // Ajoute ces imports si besoin
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
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> AjouterInstitution(@RequestBody Institution institution) {

        System.out.println("=== POST reçu pour Institution ===");
        System.out.println("Email: " + institution.getEmail());
        System.out.println("Nom faculté: " + institution.getNomFaculte());

        // Vérification unicité email (tous rôles)
        if (institutionRepository.existsByEmail(institution.getEmail()) ||
                candidatRepository.existsByEmail(institution.getEmail()) ||
                etudiantRepository.existsByEmail(institution.getEmail()) ||
                entrepriseRepository.existsByEmail(institution.getEmail()) ||
                adminRepository.existsByEmail(institution.getEmail())) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cet email est déjà utilisé. Essayez de vous connecter."));
        }

        try {
            // Création d'un nouvel objet propre
            Institution newInstitution = new Institution();

            newInstitution.setNom(institution.getNom());
            newInstitution.setPrenom(institution.getPrenom());
            newInstitution.setEmail(institution.getEmail());
            newInstitution.setMdp(bCryptPasswordEncoder.encode(institution.getMdp()));  // hash ici
            newInstitution.setNomFaculte(institution.getNomFaculte());
            newInstitution.setRole("INSTITUTION");
            // ajoute tous les autres champs spécifiques à Institution que tu utilises

            Institution saved = institutionRepository.save(newInstitution);

            System.out.println("Institution créée avec succès - ID: " + saved.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            System.out.println("ERREUR création institution");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur lors de la création du compte institution : " + e.getMessage()));
        }
    }


    @GetMapping
    public List<Institution> AfficherInstitution(){
        return institutionService.getInstitution();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void supprimerInstitution(@PathVariable("id") Long id){
        institutionService.supprimerinstitution(id);

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInstitutionById(@PathVariable Long id) {

        Optional<Institution> institution = institutionRepository.findById(id);

        if(institution.isPresent()){
            return ResponseEntity.ok(institution.get());
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Institution introuvable");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInstitution(@PathVariable Long id, @RequestBody Institution data){

        Optional<Institution> optionalInstitution = institutionRepository.findById(id);

        if(optionalInstitution.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Institution non trouvée");
        }

        Institution institution = optionalInstitution.get();

        institution.setNomFaculte(data.getNomFaculte());
        institution.setEmail(data.getEmail());

        if(data.getMdp() != null && !data.getMdp().isEmpty()){
            institution.setMdp(bCryptPasswordEncoder.encode(data.getMdp()));
        }

        institutionRepository.save(institution);

        return ResponseEntity.ok(institution);
    }




    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Institution institution) {
        System.out.println("in login-institution"+institution);
        HashMap<String, Object> response = new HashMap<>();

        Institution userFromDB = institutionRepository.findInstitutionByEmail(institution.getEmail());
        System.out.println("userFromDB+institution"+userFromDB);
        if (userFromDB == null) {
            response.put("message", "Institution not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(institution.getMdp(), (String) userFromDB.getMdp());
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
    @PostMapping("/forgotpassword")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        System.out.println("Requête forgotPassword reçue pour email: " + email);
        Map<String, Object> response = new HashMap<>();

        Institution institution = institutionRepository.findInstitutionByEmail(email);
        if (institution == null) {
            // Pour sécurité : on renvoie toujours "email envoyé" même si pas trouvé
            response.put("success", true);
            response.put("message", "Si l'email existe, un lien de réinitialisation a été envoyé.");
            return ResponseEntity.ok(response);
        }

        String resetToken = generateResetToken(email,"institution");

        // Lien (adapte l'URL frontend selon ton domaine / port)
        String resetLink = "http://localhost:4200/resetpassword?token=" + resetToken;
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

            Institution institution = institutionRepository.findInstitutionByEmail(email);
            if (institution == null) {
                throw new Exception("Compte introuvable");
            }

            // Mise à jour mot de passe
            institution.setMdp(bCryptPasswordEncoder.encode(newPassword));
            institutionRepository.save(institution);

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
    @GetMapping("/count")
    public Map<String, Long> countInstitutions() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("institutions", institutionRepository.count()); // Hibernate filtre automatiquement dtype = 'Admin'
        return stats;
    }
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @PostMapping("/signin-google")
    public ResponseEntity<Map<String, Object>> loginWithGoogle(@RequestParam("id_token") String idToken) {
        Map<String, Object> response = new HashMap<>();
        try {
            String googleUserInfo = validateGoogleToken(idToken);
            JsonNode userInfo = new ObjectMapper().readTree(googleUserInfo);

            String email = userInfo.get("email").asText();
            String fullName = userInfo.get("name").asText();
            String firstName = fullName.split(" ")[0]; // Prenons le prénom comme étant la première partie du nom complet
            String lastName = fullName.split(" ").length > 1 ? fullName.split(" ")[1] : ""; // Nom de famille s'il existe

            Institution existingInstitution = institutionRepository.findInstitutionByEmail(email);

            if (existingInstitution == null) {

                Institution newInstitution = new Institution();
                newInstitution.setEmail(email);
                newInstitution.setNom(lastName); // Nom
                newInstitution.setPrenom(firstName); // Prénom
                newInstitution.setMdp("defaultPassword"); // Mot de passe temporaire, à changer plus tard


                institutionRepository.save(newInstitution);
                existingInstitution = newInstitution;
            }

            String token = generateToken(existingInstitution);
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("message", "Erreur lors du traitement du token Google : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "Une erreur inconnue est survenue.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String validateGoogleToken(String idToken) {
        String url = GOOGLE_TOKEN_URL + idToken;
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }

    private String generateToken(Institution Institution) {
        return Jwts.builder()
                .claim("data", Institution)
                .signWith(SignatureAlgorithm.HS256, "SECRET_KEY")
                .compact();
    }
    // ═══════════════════════════════════════════════════════════════
    // ✅ NOUVELLES MÉTHODES AJOUTÉES — Espace Institution
    // ═══════════════════════════════════════════════════════════════

    // ── 1. Autocomplétion nom d'institution ──────────────────────
    // Appelée quand l'étudiant tape le nom de son institution
    // à l'inscription. Retourne la liste des institutions dont
    // le nomFaculte contient le texte saisi, insensible à la casse.
    // Exemple : GET /institution/search?nom=isi
    @GetMapping("/search")
    public ResponseEntity<?> searchInstitutions(@RequestParam String nom) {
        List<Institution> results = institutionRepository
                .findByNomFaculteContainingIgnoreCase(nom);
        return ResponseEntity.ok(results);
    }

    // ── 2. Liste des étudiants de l'institution ──────────────────
    // Retourne uniquement les étudiants rattachés à cette institution.
    // L'institution ne doit voir QUE ses propres étudiants,
    // pas tous les étudiants de la plateforme.
    // Exemple : GET /institution/5/etudiants
    @GetMapping("/{id}/etudiants")
    public ResponseEntity<?> getEtudiantsByInstitution(@PathVariable Long id) {
        List<Etudiant> etudiants = institutionService.getEtudiantsByInstitution(id);
        System.out.println("Étudiants trouvés pour institution " + id + " : " + etudiants.size());
        return ResponseEntity.ok(etudiants);
    }

    // ── 3. Candidatures des étudiants de l'institution ───────────
    // L'institution accède aux candidatures de SES étudiants
    // pour pouvoir les valider ou les refuser.
    // L'offre est accessible via candidature.getOffre() —
    // on ne touche pas OffreRepository directement.
    // Exemple : GET /institution/5/candidatures
    @GetMapping("/{id}/candidatures")
    public ResponseEntity<?> getCandidaturesByInstitution(@PathVariable Long id) {
        return ResponseEntity.ok(
                institutionService.getCandidaturesByInstitution(id));
    }

    // ── 4. Accepter une candidature ──────────────────────────────
    // Le responsable académique accepte le stage d'un étudiant.
    // Le Service s'occupe de :
    //   - Mettre à jour le statut → ACCEPTE
    //   - Enregistrer la dateDecision
    //   - Générer le PDF lettre d'affectation
    //   - Envoyer l'email avec le PDF en pièce jointe
    // Le Controller ne gère que la réponse HTTP.
    // Exemple : PUT /institution/candidature/12/accepter
    @PutMapping("/candidature/{candidatureId}/accepter")
    public ResponseEntity<?> accepterCandidature(@PathVariable Long candidatureId) {
        try {
            Candidature candidature = institutionService
                    .accepterCandidature(candidatureId);
            return ResponseEntity.ok(Map.of(
                    "message", "Stage accepté et email envoyé avec succès",
                    "candidature", candidature));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur : " + e.getMessage()));
        }
    }

    // ── 5. Refuser une candidature avec motif ────────────────────
    // Le responsable académique refuse le stage d'un étudiant
    // en précisant obligatoirement un motif.
    // Le Service s'occupe de :
    //   - Mettre à jour le statut → REFUSE
    //   - Enregistrer motifRefus + dateDecision
    //   - Envoyer l'email de refus avec le motif à l'étudiant
    // Body attendu : { "motif": "Places insuffisantes" }
    // Exemple : PUT /institution/candidature/12/refuser
    @PutMapping("/candidature/{candidatureId}/refuser")
    public ResponseEntity<?> refuserCandidature(
            @PathVariable Long candidatureId,
            @RequestBody Map<String, String> body) {

        String motif = body.getOrDefault("motif", "Aucun motif précisé");
        Candidature candidature = institutionService
                .refuserCandidature(candidatureId, motif);
        return ResponseEntity.ok(Map.of(
                "message", "Candidature refusée et email envoyé",
                "motif", motif,
                "candidature", candidature));
    }
    @Autowired
    private OtpStore otpStore;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Institution institution = institutionRepository.findInstitutionByEmail(email);
        if (institution == null)
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

        Institution institution = institutionRepository.findInstitutionByEmail(email);
        if (institution == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Utilisateur introuvable"));

        institution.setMdp(new BCryptPasswordEncoder().encode(newPassword));
        institutionRepository.save(institution);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
    // ── Récupérer les encadrants d'une institution ──────────────
    @GetMapping("/{id}/encadrants")
    public ResponseEntity<List<String>> getEncadrants(@PathVariable Long id) {
        return institutionRepository.findById(id)
                .map(inst -> ResponseEntity.ok(inst.getEncadrants()))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Ajouter un encadrant ────────────────────────────────────
    @PostMapping("/{id}/encadrants")
    public ResponseEntity<?> addEncadrant(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        String encadrant = body.get("encadrant"); // format "Nom Prénom|email"
        Institution inst = institutionRepository.findById(id).orElse(null);
        if (inst == null) return ResponseEntity.notFound().build();

        if (!inst.getEncadrants().contains(encadrant))
            inst.getEncadrants().add(encadrant);

        institutionRepository.save(inst);
        return ResponseEntity.ok(inst.getEncadrants());
    }

    // ── Supprimer un encadrant ──────────────────────────────────
    @DeleteMapping("/{id}/encadrants")
    public ResponseEntity<?> removeEncadrant(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        String encadrant = body.get("encadrant");
        Institution inst = institutionRepository.findById(id).orElse(null);
        if (inst == null) return ResponseEntity.notFound().build();

        inst.getEncadrants().remove(encadrant);
        institutionRepository.save(inst);
        return ResponseEntity.ok(inst.getEncadrants());
    }

    // ── Étudiant choisit un encadrant (après inscription) ───────
    @PutMapping("/etudiant/{etudiantId}/choisir-encadrant")
    public ResponseEntity<?> choisirEncadrant(@PathVariable Long etudiantId,
                                              @RequestBody Map<String, String> body) {
        String encadrant = body.get("encadrant");

        Etudiant etudiant = etudiantRepository.findById(etudiantId).orElse(null);
        if (etudiant == null) return ResponseEntity.notFound().build();

        // Vérifier la limite de 12 étudiants pour cet encadrant
        Institution inst = etudiant.getInstitution();
        if (inst != null) {
            long count = inst.getEtudiants().stream()
                    .filter(e -> encadrant.equals(e.getEncadrantChoisi())
                            && "ACCEPTE".equals(e.getStatutEncadrant()))
                    .count();
            if (count >= 12)
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cet encadrant a atteint la limite de 12 étudiants."));
        }

        etudiant.setEncadrantChoisi(encadrant);
        etudiant.setStatutEncadrant("EN_ATTENTE");
        etudiantRepository.save(etudiant);

        // Notifier l'institution par email
        if (inst != null) {
            emailService.SendSimpleMessage(inst.getEmail(),
                    "Nouveau choix d'encadrant — InternMatch",
                    "L'étudiant " + etudiant.getPrenom() + " " + etudiant.getNom()
                            + " a choisi l'encadrant : " + encadrant
                            + "\nVeuillez valider ou refuser ce choix depuis votre espace.");
        }

        return ResponseEntity.ok(Map.of("message", "Choix envoyé à l'institution pour validation."));
    }

    // ── Institution valide ou refuse le choix d'encadrant ───────
    @PutMapping("/etudiant/{etudiantId}/valider-encadrant")
    public ResponseEntity<?> validerEncadrant(@PathVariable Long etudiantId,
                                              @RequestBody Map<String, String> body) {
        String decision = body.get("decision"); // "ACCEPTE" ou "REFUSE"
        String motif    = body.get("motif");    // optionnel si REFUSE

        Etudiant etudiant = etudiantRepository.findById(etudiantId).orElse(null);
        if (etudiant == null) return ResponseEntity.notFound().build();

        etudiant.setStatutEncadrant(decision);
        etudiantRepository.save(etudiant);

        // Notifier l'étudiant
        String msg = "ACCEPTE".equals(decision)
                ? "Votre choix d'encadrant (" + etudiant.getEncadrantChoisi() + ") a été accepté !"
                : "Votre choix d'encadrant a été refusé." + (motif != null ? " Motif : " + motif : "")
                  + "\nVeuillez choisir un autre encadrant depuis votre profil.";

        emailService.SendSimpleMessage(etudiant.getEmail(), "Décision encadrant — InternMatch", msg);

        return ResponseEntity.ok(Map.of("message", "Décision enregistrée."));
    }
}


