package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.CandidatureRepository;
import com.projet.internmatch.entity.Candidature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidatureServiceImpl implements CandidatureService {

    private final CandidatureRepository candidatureRepository;

    @Override
    public List<Candidature> findAll() {
        return candidatureRepository.findAll();
    }

    @Override
    public Candidature findById(Long id) {
        return candidatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Postulation non trouvée avec l'id : " + id));
    }

    @Override
    public List<Candidature> findByEtudiantId(Long etudiantId) {
        return candidatureRepository.findByEtudiantId(etudiantId);
    }

    @Override
    public List<Candidature> findByOffreId(Long offreId) {
        return candidatureRepository.findByOffreId(offreId);
    }

    @Override
    public List<Candidature> findByCandidatId(Long candidatId) {
        return candidatureRepository.findByCandidatId(candidatId);
    }

    @Override
    public Candidature save(Candidature postulation) {
        if (postulation.getDatePostulation() == null) {
            postulation.setDatePostulation(new java.util.Date());
        }
        return candidatureRepository.save(postulation);
    }

    @Override
    public void deleteById(Long id) {
        candidatureRepository.deleteById(id);
    }

    @Override
    public boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId) {
        return candidatureRepository.existsByEtudiantIdAndOffreId(etudiantId, offreId);
    }

    @Override
    public boolean existsByCandidatIdAndOffreId(Long candidatId, Long offreId) {
        return candidatureRepository.existsByCandidatIdAndOffreId(candidatId, offreId);
    }
}