package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.CandidatRepository;
import com.projet.internmatch.Repository.EtudiantRepository;
import com.projet.internmatch.Repository.OffreRepository;
import com.projet.internmatch.entity.Candidat;
import com.projet.internmatch.entity.Etudiant;
import com.projet.internmatch.entity.Offre;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class RecommandationServiceImpl implements RecommandationService {

    @Autowired private EtudiantRepository etudiantRepository;
    @Autowired private CandidatRepository candidatRepository;
    @Autowired private OffreRepository    offreRepository;

    private static final double POIDS_JACCARD   = 70.0;
    private static final double BONUS_NIVEAU    = 10.0;
    private static final double SCORE_TOTAL_MAX = 80.0;  // POIDS_JACCARD + BONUS_NIVEAU
    private static final int    SEUIL_AFFICHAGE = 20;

    private static final Set<String> TYPES_ETUDIANT = Set.of("stage");
    private static final Set<String> TYPES_CANDIDAT = Set.of("emploi");

    /**
     * DOMAINE_SECTEURS : chaque domaine-clé est associé UNIQUEMENT à des mots
     * spécifiques à ce domaine. On a supprimé les mots génériques inter-domaines
     * (ex: "gestion", "administration", "digital") qui causaient des faux positifs.
     *
     * Règle appliquée : un mot ne doit apparaître que dans UN SEUL domaine.
     */
    private static final Map<String, List<String>> DOMAINE_SECTEURS = new LinkedHashMap<>();
    static {
        // ── Informatique & numérique ─────────────────────────────────────────
        DOMAINE_SECTEURS.put("informatique",     List.of("informatique","developpement","logiciel","numerique","cybersecurite","ia","intelligence artificielle","angular","react","spring","java","python","javascript","typescript","backend","frontend","fullstack","devops","docker","kubernetes"));
        DOMAINE_SECTEURS.put("genie logiciel",   List.of("genie logiciel","informatique","developpement","logiciel","numerique","ia","angular","react","spring","java","architecture logicielle","uml","agile","scrum"));
        DOMAINE_SECTEURS.put("developpement",    List.of("developpement","informatique","logiciel","numerique","angular","react","spring","java","python","javascript","api","rest","microservices"));
        DOMAINE_SECTEURS.put("data",             List.of("data","bigdata","machine learning","deep learning","datascience","python","r","spark","hadoop","sql","nosql","tableau","powerbi","analyse de donnees"));
        DOMAINE_SECTEURS.put("reseaux",          List.of("reseaux","securite","infrastructure","systemes","cisco","linux","vpn","firewall","wifi","lan","wan","administration systeme","unix"));
        DOMAINE_SECTEURS.put("cloud",            List.of("cloud","aws","azure","gcp","devops","docker","kubernetes","terraform","infrastructure","saas","paas","iaas"));

        // ── Commerce, gestion, finance ────────────────────────────────────────
        DOMAINE_SECTEURS.put("commerce",         List.of("commerce","vente","achat","negociation","commercial","b2b","b2c","grande distribution","retail","approvisionnement","logistique commerciale"));
        DOMAINE_SECTEURS.put("marketing",        List.of("marketing","communication","publicite","media","seo","sem","contenu","reseaux sociaux","emailing","branding","campagne","influence","google ads","facebook ads"));
        DOMAINE_SECTEURS.put("gestion",          List.of("gestion","comptabilite","audit","erp","sap","controle de gestion","budget","reporting","tableaux de bord","bilan","tresorerie"));
        DOMAINE_SECTEURS.put("finance",          List.of("finance","banque","assurance","bourse","credit","trading","investissement","risque financier","comptabilite bancaire","microfinance","leasing","fonds"));
        DOMAINE_SECTEURS.put("rh",               List.of("ressources humaines","rh","recrutement","formation","paie","gpec","talent","onboarding","sirh","droit du travail","evaluation"));
        DOMAINE_SECTEURS.put("logistique",       List.of("logistique","supply chain","transport","entrepot","stock","livraison","importation","exportation","douane","wms","tms","lean"));

        // ── Ingénierie ────────────────────────────────────────────────────────
        DOMAINE_SECTEURS.put("genie civil",      List.of("genie civil","btp","construction","architecture","urbanisme","travaux publics","autocad","revit","beton","structure","topographie","route","pont"));
        DOMAINE_SECTEURS.put("genie mecanique",  List.of("genie mecanique","mecanique","automobile","aeronautique","production","maintenance","solidworks","catia","usinage","robotique","cfao","thermodynamique"));
        DOMAINE_SECTEURS.put("genie electrique", List.of("genie electrique","electrique","electronique","energie","automatisme","matlab","arduino","plc","variateur","transformateur","habilitation","hse"));
        DOMAINE_SECTEURS.put("genie industriel", List.of("genie industriel","qualite","lean","six sigma","iso","amelioration continue","hsqe","methodes","ordonnancement","production","kaizen"));

        // ── Sciences de la vie ────────────────────────────────────────────────
        DOMAINE_SECTEURS.put("biologie",         List.of("biologie","biochimie","microbiologie","laboratoire","agroalimentaire","pharmacologie","genetique","ecologie","sante","sciences de la vie"));
        DOMAINE_SECTEURS.put("chimie",           List.of("chimie","chimie organique","chimie analytique","petrole","polymere","industrie chimique","laboratoire chimie","formulation"));
        DOMAINE_SECTEURS.put("pharmacie",        List.of("pharmacie","pharmaceutique","medicament","essai clinique","biomedical","sante","hopital","officine","reglementation pharmaceutique"));

        // ── Autres domaines ───────────────────────────────────────────────────
        DOMAINE_SECTEURS.put("droit",            List.of("juridique","droit","notariat","contentieux","contrats","compliance","droit des affaires","droit social","tribunal","avocat"));
        DOMAINE_SECTEURS.put("design",           List.of("design","graphisme","ui","ux","infographie","illustration","adobe","figma","photoshop","indesign","identite visuelle","motion design","web design"));
        DOMAINE_SECTEURS.put("enseignement",     List.of("enseignement","formation","pedagogie","e-learning","tutorat","education","ecole","universite","cours","professeur"));
        DOMAINE_SECTEURS.put("agriculture",      List.of("agriculture","agronomie","elevage","irrigation","cultures","semences","agro-industrie","veterinaire","rurale"));
        DOMAINE_SECTEURS.put("tourisme",         List.of("tourisme","hotellerie","restauration","accueil","guide touristique","voyage","evenementiel","mice","reservation"));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RECOMMANDATION ÉTUDIANT
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    public List<Map<String, Object>> recommanderPourEtudiant(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiantId));

        String specialite = etudiant.getSpecialite();
        String niveau     = etudiant.getNiveau();

        Set<String>  domainesUtilisateur = detecterDomaines(specialite);
        List<String> secteursValides     = resoudreSecteursPourDomaines(domainesUtilisateur);
        Set<String>  profilTokens        = construireProfilEtudiant(specialite, niveau, secteursValides);

        List<Offre>               toutesOffres = offreRepository.findAll();
        List<Map<String, Object>> resultats    = new ArrayList<>();

        for (Offre offre : toutesOffres) {
            // 1. Filtre type : uniquement les stages
            if (!estTypeAutorise(offre.getType(), TYPES_ETUDIANT)) continue;

            // 2. Filtre secteur STRICT : l'offre doit appartenir au domaine de l'étudiant
            //    Si secteur non renseigné → on EXCLUT l'offre (trop risqué de la montrer)
            if (!secteurMatchStrict(offre, domainesUtilisateur, secteursValides)) continue;

            // 3. Score Jaccard sur tokens pertinents uniquement
            Set<String> tokensOffre = tokeniserOffre(offre, secteursValides);
            double jaccard      = jaccard(profilTokens, tokensOffre);
            double scoreJaccard = jaccard * POIDS_JACCARD;
            double bonusNiveau  = calculerBonusNiveau(niveau, offre.getType());
            double scoreTotal   = scoreJaccard + bonusNiveau;
            int    pct          = (int) Math.min(Math.round((scoreTotal / SCORE_TOTAL_MAX) * 100), 100);
            // Garantir un minimum visible pour les offres qui ont passé le filtre secteur
            pct = Math.max(pct, SEUIL_AFFICHAGE + 5);

            Map<String, Object> item = new HashMap<>();
            item.put("offre", offre);
            item.put("pourcentage", Math.min(pct, 100));
            resultats.add(item);
        }

        resultats.sort((a, b) -> Integer.compare((int) b.get("pourcentage"), (int) a.get("pourcentage")));
        return resultats.stream().limit(6).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RECOMMANDATION CANDIDAT
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    public List<Map<String, Object>> recommanderPourCandidat(Long candidatId) {
        Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat introuvable : " + candidatId));

        Set<String>  domainesUtilisateur = detecterDomaines(candidat.getSecteur());
        List<String> secteursValides     = resoudreSecteursPourDomaines(domainesUtilisateur);
        Set<String>  profilTokens        = construireProfilCandidat(candidat.getCompetences(), candidat.getSecteur(), secteursValides);

        List<Offre>               toutesOffres = offreRepository.findAll();
        List<Map<String, Object>> resultats    = new ArrayList<>();

        for (Offre offre : toutesOffres) {
            if (!estTypeAutorise(offre.getType(), TYPES_CANDIDAT)) continue;
            if (!secteurMatchStrict(offre, domainesUtilisateur, secteursValides)) continue;

            Set<String> tokensOffre = tokeniserOffre(offre, secteursValides);
            double jaccard      = jaccard(profilTokens, tokensOffre);
            double scoreJaccard = jaccard * POIDS_JACCARD;
            int    pct          = (int) Math.min(Math.round((scoreJaccard / POIDS_JACCARD) * 100), 100);
            pct = Math.max(pct, SEUIL_AFFICHAGE + 5);

            Map<String, Object> item = new HashMap<>();
            item.put("offre", offre);
            item.put("pourcentage", Math.min(pct, 100));
            resultats.add(item);
        }

        resultats.sort((a, b) -> Integer.compare((int) b.get("pourcentage"), (int) a.get("pourcentage")));
        return resultats.stream().limit(6).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FILTRE SECTEUR STRICT
    // Un seul point d'entrée. Retourne true UNIQUEMENT si le secteur de
    // l'offre appartient au même domaine que l'utilisateur.
    // Les offres sans secteur sont EXCLUES (trop imprécises).
    // ═══════════════════════════════════════════════════════════════════════
    private boolean secteurMatchStrict(Offre offre, Set<String> domainesUtilisateur, List<String> secteursUtilisateur) {
        if (domainesUtilisateur.isEmpty()) return false;

        String secteurOffre = offre.getSecteur();
        // ✅ FIX PRINCIPAL : offre sans secteur → EXCLUE (ne plus accepter null/blank)
        if (secteurOffre == null || secteurOffre.isBlank()) return false;

        Set<String> domainesOffre = detecterDomaines(secteurOffre);

        // Étape 1 : les domaines détectés se chevauchent directement
        for (String domaine : domainesOffre) {
            if (domainesUtilisateur.contains(domaine)) return true;
        }

        // Étape 2 : les secteurs spécifiques résolus se chevauchent
        // (uniquement via les listes non-polluées de DOMAINE_SECTEURS)
        List<String> secteursOffre = resoudreSecteursPourDomaines(domainesOffre);
        for (String s : secteursOffre) {
            if (secteursUtilisateur.contains(s)) return true;
        }

        // Étape 3 : match textuel direct sur les tokens du secteur de l'offre
        // vs les secteurs valides de l'utilisateur (ex: "banque" ne figure pas
        // dans DOMAINE_SECTEURS["informatique"], donc retourne false)
        Set<String> tokensSecteursOffre = new HashSet<>(extraireMots(secteurOffre));
        Set<String> secteursUtilisateurSet = new HashSet<>(secteursUtilisateur);
        for (String token : tokensSecteursOffre) {
            if (secteursUtilisateurSet.contains(token)) return true;
        }

        return false;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DÉTECTION DE DOMAINES
    // ═══════════════════════════════════════════════════════════════════════
    private Set<String> detecterDomaines(String texte) {
        if (texte == null || texte.isBlank()) return Collections.emptySet();
        Set<String> domaines = new LinkedHashSet<>();
        String norm = normalize(texte);

        // 1. Match exact de la phrase entière
        if (DOMAINE_SECTEURS.containsKey(norm)) {
            domaines.add(norm);
            return domaines;
        }

        // 2. Match mot par mot sur les clés
        for (String mot : extraireMots(texte)) {
            if (DOMAINE_SECTEURS.containsKey(mot)) {
                domaines.add(mot);
            }
        }

        // 3. Fallback : la phrase normalisée contient une clé connue
        if (domaines.isEmpty()) {
            for (String cle : DOMAINE_SECTEURS.keySet()) {
                if (norm.contains(cle)) {
                    domaines.add(cle);
                    break; // premier match suffit pour le fallback
                }
            }
        }

        return domaines;
    }

    private List<String> resoudreSecteursPourDomaines(Set<String> domaines) {
        Set<String> secteurs = new LinkedHashSet<>();
        for (String domaine : domaines) {
            List<String> s = DOMAINE_SECTEURS.get(domaine);
            if (s != null) secteurs.addAll(s);
        }
        return new ArrayList<>(secteurs);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTION DU PROFIL
    // ═══════════════════════════════════════════════════════════════════════
    private Set<String> construireProfilEtudiant(String specialite, String niveau, List<String> secteursValides) {
        Set<String> tokens = new HashSet<>();
        tokens.addAll(extraireMots(specialite));
        tokens.addAll(secteursValides);
        if (niveau != null && !niveau.isBlank()) tokens.addAll(extraireMots(niveau));
        return tokens;
    }

    private Set<String> construireProfilCandidat(String competences, String domaine, List<String> secteursValides) {
        Set<String> tokens = new HashSet<>();
        tokens.addAll(extraireMots(competences));
        tokens.addAll(extraireMots(domaine));
        tokens.addAll(secteursValides);
        return tokens;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TOKENISATION DE L'OFFRE
    // On n'utilise QUE le titre + secteur pour le Jaccard, pas la description
    // (la description libre peut contenir des mots de n'importe quel domaine)
    // ═══════════════════════════════════════════════════════════════════════
    private Set<String> tokeniserOffre(Offre offre, List<String> secteursValides) {
        // Seulement titre et secteur — la description est trop bruyante
        String texte = Stream.of(offre.getTitre(), offre.getSecteur())
                .filter(Objects::nonNull).map(this::normalize).collect(Collectors.joining(" "));
        Set<String> tokens = new HashSet<>(extraireMots(texte));
        // On enrichit avec les secteurs résolus de l'offre (depuis la map propre)
        Set<String> domainesOffre = detecterDomaines(offre.getSecteur());
        tokens.addAll(resoudreSecteursPourDomaines(domainesOffre));
        return tokens;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITAIRES
    // ═══════════════════════════════════════════════════════════════════════
    private double jaccard(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / union.size();
    }

    private double calculerBonusNiveau(String niveau, String typeOffre) {
        if (niveau == null || typeOffre == null) return 0;
        return normalize(typeOffre).contains("stage") ? BONUS_NIVEAU : 0;
    }

    private boolean estTypeAutorise(String typeOffre, Set<String> typesAutorises) {
        if (typeOffre == null || typeOffre.isBlank()) return false;
        return typesAutorises.contains(normalize(typeOffre));
    }

    private List<String> extraireMots(String texte) {
        if (texte == null || texte.isBlank()) return Collections.emptyList();
        return Arrays.stream(texte.toLowerCase().split("[\\s,;/+|()'.\\-]+"))
                .map(this::normalize).filter(m -> m.length() > 2).collect(Collectors.toList());
    }

    private String normalize(String texte) {
        if (texte == null) return "";
        return java.text.Normalizer.normalize(texte.toLowerCase(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "").trim();
    }
}