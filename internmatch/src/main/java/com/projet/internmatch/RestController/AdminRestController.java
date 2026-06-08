package com.projet.internmatch.RestController;

import com.projet.internmatch.Service.EmailService;
import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.Repository.AdminRepository;
import com.projet.internmatch.Service.AdminService;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


import java.util.*;



@RestController // ray l classe hethy bech tahki aa bd mt3y hiya ly fiha les requetes mt3y
@RequestMapping(value= "/admin")
@CrossOrigin("*")
public class AdminRestController {
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    // Ta clé secrète (doit être la même que pour l'authentification normale !)
    private static final String RESET_SECRET = "a4d32l"; // ← mets la même que pour login si possible
    @Autowired
    EmailService emailService;
    @Autowired
    AdminRepository adminRepository;
    @Autowired
    AdminService adminService;
    // Ajoute ces imports si besoin
    private String generateResetToken(String email) {
        long EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes

        return Jwts.builder()
                .setSubject(email)                          // email dans le subject
                .claim("purpose", "password_reset")         // pour valider l'usage
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS256, RESET_SECRET.getBytes())  // ← clé en bytes + algo
                .compact();
    }
    @Autowired
    MailSender mailSender;
    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> AjouterAdmin(@RequestBody Admin admin){

        HashMap<String, Object> response = new HashMap<>();

        if(adminRepository.existsByEmail(admin.getEmail())){
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {


            String rawPassword = admin.getMdp();


            admin.setMdp(this.bCryptPasswordEncoder.encode(rawPassword));

            Admin savedUser = adminRepository.save(admin);

            try {
                SimpleMailMessage message = new SimpleMailMessage();

                message.setTo(admin.getEmail());
                message.setSubject("Votre compte a été créé");

                message.setText(
                        "Bonjour " + admin.getPrenom() + ",\n\n" +
                                "Votre compte a été créé avec succès.\n\n" +
                                "Email: " + admin.getEmail() + "\n" +
                                "Mot de passe: " + rawPassword + "\n\n" +
                                "Veuillez vous connecter, changer votre mot de passe.\n\n" +
                                "Merci."
                );

                mailSender.send(message);

            } catch (Exception e) {
                System.out.println("❌ Error sending email to: " + admin.getEmail());
                e.printStackTrace();
                throw e;
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        }
    }

    @GetMapping
    public List<Admin> AfficherAdmin(){
        return adminService.getAdmin();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void SupprimerAdmin(@PathVariable("id") Long id){
        adminService.supprimeradmin(id);

    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Admin> getAdminById(@PathVariable("id") Long id){
        Optional<Admin> admin = adminService.afficheradminById(id);
        return admin;
    }

    @RequestMapping(value = "/{id}" ,method = RequestMethod.PUT)
    public Admin ModifierAdmin(@PathVariable("id")Long id, @RequestBody Admin admin){
        admin.setMdp(this.bCryptPasswordEncoder.encode(admin.getMdp()));
        Admin savedUser = adminRepository.save(admin);

        Admin newAdmin = adminService.modifieradmin(admin);
        return newAdmin;
    }




    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Admin admin) {
        System.out.println("in login-admin"+admin);
        HashMap<String, Object> response = new HashMap<>();

        Admin userFromDB = adminRepository.findAdminByEmail(admin.getEmail());
        System.out.println("userFromDB+admin"+userFromDB);
        if (userFromDB == null) {
            response.put("message", "Admin not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(admin.getMdp(), (String) userFromDB.getMdp());
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

        Admin admin = adminRepository.findAdminByEmail(email);
        if (admin == null) {
            // Pour sécurité : on renvoie toujours "email envoyé" même si pas trouvé
            response.put("success", true);
            response.put("message", "Si l'email existe, un lien de réinitialisation a été envoyé.");
            return ResponseEntity.ok(response);
        }

        String resetToken = generateResetToken(email);

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

            Admin admin = adminRepository.findAdminByEmail(email);
            if (admin == null) {
                throw new Exception("Compte introuvable");
            }

            // Mise à jour mot de passe
            admin.setMdp(bCryptPasswordEncoder.encode(newPassword));
            adminRepository.save(admin);

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
    public Map<String, Long> countAdmins() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("admins", adminRepository.count()); // Hibernate filtre automatiquement dtype = 'Admin'
        return stats;
    }
}
