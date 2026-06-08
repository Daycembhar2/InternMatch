package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.CandidatureRepository;
import com.projet.internmatch.Repository.EntrepriseRepository;
import com.projet.internmatch.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepriseServiceImpl implements EntrepriseService {

    @Autowired
    EntrepriseRepository entrepriseRepository;

    @Autowired
    CandidatureRepository candidatureRepository;

    @Autowired
    EmailService emailService;



    @Override
    public ResponseEntity<?> save(Entreprise entreprise) {
        Entreprise existingUser = entrepriseRepository.findEntrepriseByEmail(entreprise.getEmail());
        if (existingUser != null) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        return ResponseEntity.ok("entreprise saved");
    }

    @Override
    public void supprimerentreprise(Long id) {
        entrepriseRepository.deleteById(id);
    }

    @Override
    public Optional<Entreprise> afficherentrepriseById(Long id) {
        return entrepriseRepository.findById(id);
    }

    @Override
    public List<Candidature> consulterCandidature(Entreprise entreprise) {
        return candidatureRepository.findAll();
    }

    @Override
    public Entreprise suivreWorkflow(Entreprise entreprise) {
        Entreprise savedEntreprise = entrepriseRepository.save(entreprise);

        String subject = "Confirmation d'ajout d'entreprise";
        String text = "Bonjour " + savedEntreprise.getNom()
                + ",\n\nVotre entreprise a été ajoutée avec succès sur InternMatch.";

        try {
            emailService.SendSimpleMessage(savedEntreprise.getEmail(), subject, text);
        } catch (Exception e) {
            System.err.println("Erreur email : " + e.getMessage());
        }

        return savedEntreprise;
    }

    @Override
    public Utilisateur addUtilisateur(Utilisateur utilisateur) {
        return null;
    }

    @Override
    public Utilisateur authentifier(String email, String mdp) {
        return null;
    }

    @Override
    public List<Utilisateur> findAll() {
        return List.of();
    }
}