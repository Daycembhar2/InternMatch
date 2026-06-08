package com.projet.internmatch.RestController;
import com.projet.internmatch.Service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/auth")
@CrossOrigin("*") // ⚡ Autorise Angular
public class AuthRestController {

        private final AuthService authService;

        public AuthRestController(AuthService authService) {
            this.authService = authService;
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
            String email = body.get("email");
            String mdp = body.get("mdp");

            boolean ok = authService.authenticate(email, mdp);

            if(ok) {
                Map<String, String> response = new HashMap<>();
                response.put("token", "FAKE-JWT-TOKEN"); // Plus tard, tu mets un vrai JWT
                response.put("email", email);
                response.put("role",body.get("role"));
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Email ou mot de passe incorrect");
            }
        }
    }
