package com.projet.internmatch.Service;

import java.util.List;
import java.util.Map;

public interface RecommandationService {
    List<Map<String, Object>> recommanderPourEtudiant(Long etudiantId);
    List<Map<String, Object>> recommanderPourCandidat(Long candidatId);
}