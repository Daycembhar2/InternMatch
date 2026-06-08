package com.projet.internmatch.RestController;

import com.projet.internmatch.Service.RecommandationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommandation")
@CrossOrigin("*")
public class RecommandationRestController {

    @Autowired
    RecommandationService recommandationService;

    // GET /recommandation/etudiant/30
    @GetMapping("/etudiant/{id}")
    public ResponseEntity<List<Map<String, Object>>> pourEtudiant(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                recommandationService.recommanderPourEtudiant(id));
    }

    // GET /recommandation/candidat/12
    @GetMapping("/candidat/{id}")
    public ResponseEntity<List<Map<String, Object>>> pourCandidat(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                recommandationService.recommanderPourCandidat(id));
    }
}