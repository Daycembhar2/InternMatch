package com.projet.internmatch.RestController;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/ia")
@CrossOrigin("*")
public class IA_Controller {

    private final String FASTAPI_URL = "http://localhost:8000/ameliorer";

    @PostMapping("/ameliorer")
    public ResponseEntity<?> ameliorer(@RequestBody Map<String, String> body) {
        String texte    = body.getOrDefault("texte", "");
        String contexte = body.getOrDefault("contexte", "");

        if (texte.isBlank())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Texte vide"));

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> payload = Map.of(
                    "texte", texte,
                    "contexte", contexte
            );

            HttpEntity<Map<String, String>> request =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    FASTAPI_URL, request, Map.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Service IA indisponible : " + e.getMessage()));
        }
    }
    @PostMapping("/analyser-cv")
    public ResponseEntity<?> analyserCV(@RequestBody Map<String, String> body) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "http://localhost:8000/analyser-cv", request, Map.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur analyse CV : " + e.getMessage()));
        }
    }
}