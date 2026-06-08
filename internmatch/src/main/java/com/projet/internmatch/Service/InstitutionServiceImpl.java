package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.CandidatureRepository;
import com.projet.internmatch.Repository.EtudiantRepository;
import com.projet.internmatch.Repository.InstitutionRepository;
import com.projet.internmatch.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class InstitutionServiceImpl implements InstitutionService {

    // ✅ Seulement les repositories légitimes pour l'Institution :
    // - InstitutionRepository  → son propre repo
    // - CandidatureRepository  → pont vers les offres et étudiants
    // - EtudiantRepository     → uniquement pour findByInstitutionId
    // ❌ OffreRepository SUPPRIMÉ — l'offre est accessible via candidature.getOffre()
    @Autowired
    InstitutionRepository institutionRepository;

    @Autowired
    CandidatureRepository candidatureRepository;

    @Autowired
    EtudiantRepository etudiantRepository;

    @Autowired
    PDFService pdfService;

    @Autowired
    EmailService emailService;

    // ────────────────────────────────────────────────────────────────
    // CRUD DE BASE
    // ────────────────────────────────────────────────────────────────

    @Override
    public Institution ajouterInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }

    @Override
    public List<Institution> getInstitution() {
        return institutionRepository.findAll();
    }

    @Override
    public void supprimerinstitution(Long id) {
        // ✅ CORRIGÉ — était vide, ne supprimait rien en base
        institutionRepository.deleteById(id);
    }

    @Override
    public Optional<Institution> afficherinstitutionbyid(Long id) {
        // ✅ CORRIGÉ — retournait Optional.empty() systématiquement
        return institutionRepository.findById(id);
    }

    // ────────────────────────────────────────────────────────────────
    // ÉTUDIANTS DE L'INSTITUTION
    // ────────────────────────────────────────────────────────────────

    @Override
    public List<Etudiant> getEtudiantsByInstitution(Long institutionId) {
        return etudiantRepository.findByInstitution_Id(institutionId);
    }
    // ────────────────────────────────────────────────────────────────
    // CANDIDATURES
    // ────────────────────────────────────────────────────────────────

    @Override
    public List<Candidature> getCandidaturesByInstitution(Long institutionId) {
        // L'institution récupère les candidatures de SES étudiants uniquement
        // via le JOIN : candidature → etudiant → institution
        // ❌ On n'utilise pas OffreRepository ici
        // ✅ L'offre est déjà embarquée dans chaque Candidature via candidature.getOffre()
        return candidatureRepository.findByEtudiant_Institution_Id(institutionId);
    }

    // ────────────────────────────────────────────────────────────────
    // ACCEPTER UN STAGE
    // ────────────────────────────────────────────────────────────────

    @Override
    public Candidature accepterCandidature(Long candidatureId) throws Exception {

        // 1. Récupérer la candidature — lance une exception si introuvable
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException(
                        "Candidature introuvable : " + candidatureId));

        // 2. Mettre à jour le statut en base
        candidature.setStatutInstitution("ACCEPTE");
        candidature.setStatutInstitution("REFUSE");
        candidature.setStatutCand(true);
        candidature.setDateDecision(new Date());
        candidatureRepository.save(candidature);

        // 3. Générer le PDF lettre d'affectation
        // Les infos de l'offre sont accessibles via candidature.getOffre()
        // sans jamais toucher OffreRepository directement
        byte[] pdf = pdfService.genererLettreAffectation(candidature);

        // 4. Construire et envoyer l'email avec le PDF en pièce jointe
        String nomEtudiant = candidature.getEtudiant().getPrenom()
                + " " + candidature.getEtudiant().getNom();
        String entreprise = candidature.getOffre().getEntreprise().getNom();
        String emailEtudiant = candidature.getEtudiant().getEmail();

        String subject = "InternMatch - Votre stage a été accepté ✅";
        String text = "Bonjour " + nomEtudiant + ",\n\n"
                + "Nous avons le plaisir de vous informer que votre candidature "
                + "pour un stage chez " + entreprise + " a été acceptée.\n\n"
                + "Veuillez trouver ci-joint votre lettre d'affectation.\n\n"
                + "Cordialement,\nL'équipe InternMatch";

        String filename = "lettre_affectation_"
                + nomEtudiant.replace(" ", "_") + ".pdf";

        emailService.sendEmailWithAttachment(
                emailEtudiant, subject, text, pdf, filename);

        return candidature;
    }

    // ────────────────────────────────────────────────────────────────
    // REFUSER UN STAGE
    // ────────────────────────────────────────────────────────────────

    @Override
    public Candidature refuserCandidature(Long candidatureId, String motif) {

        // 1. Récupérer la candidature
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException(
                        "Candidature introuvable : " + candidatureId));

        // 2. Mettre à jour le statut + enregistrer le motif + date
        candidature.setStatut("REFUSE");
        candidature.setStatutCand(false);
        candidature.setMotifRefus(motif);
        candidature.setDateDecision(new Date());
        candidatureRepository.save(candidature);

        // 3. Envoyer email de refus simple (sans pièce jointe)
        String nomEtudiant = candidature.getEtudiant().getPrenom()
                + " " + candidature.getEtudiant().getNom();
        String emailEtudiant = candidature.getEtudiant().getEmail();

        String subject = "InternMatch - Résultat de votre candidature de stage";
        String text = "Bonjour " + nomEtudiant + ",\n\n"
                + "Nous avons le regret de vous informer que votre candidature "
                + "de stage n'a pas été retenue.\n\n"
                + "Motif : " + motif + "\n\n"
                + "Nous vous encourageons à continuer vos recherches.\n\n"
                + "Cordialement,\nL'équipe InternMatch";

        emailService.SendSimpleMessage(emailEtudiant, subject, text);

        return candidature;
    }

    // ────────────────────────────────────────────────────────────────
    // GÉNÉRATION PDF
    // ────────────────────────────────────────────────────────────────

    @Override
    public byte[] genererAttestation(Candidature candidature) throws Exception {
        // ✅ CORRIGÉ — était vide et retournait null
        // Délègue proprement à PdfService
        return pdfService.genererLettreAffectation(candidature);
    }

    // ────────────────────────────────────────────────────────────────
    // MÉTHODES HÉRITÉES DE UtilisateurService
    // ────────────────────────────────────────────────────────────────

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