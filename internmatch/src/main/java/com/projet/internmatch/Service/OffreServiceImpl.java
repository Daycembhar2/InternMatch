package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.CandidatRepository;
import com.projet.internmatch.Repository.EntrepriseRepository;
import com.projet.internmatch.Repository.EtudiantRepository;
import com.projet.internmatch.Repository.OffreRepository;
import com.projet.internmatch.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OffreServiceImpl implements OffreService {

    @Autowired private OffreRepository      offreRepository;
    @Autowired private EntrepriseRepository entrepriseRepository;
    @Autowired private EtudiantRepository   etudiantRepository;
    @Autowired private CandidatRepository   candidatRepository;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DOMAINE_SECTEURS : même map que RecommandationServiceImpl, sans mots
    // inter-domaines parasites. Un mot n'apparaît que dans UN seul domaine.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    // CRUD DE BASE
    // ═══════════════════════════════════════════════════════════════════════

    @Override
    public List<Offre> afficherOffres() {
        return offreRepository.findAll();
    }

    @Override
    public List<Offre> getOffresParRole(String role) {
        return offreRepository.findAll().stream()
                .filter(o -> {
                    String statut = o.getStatutValidation();
                    return statut == null || "VALIDEE".equalsIgnoreCase(statut);
                })
                .filter(o -> {
                    String type = o.getType();
                    if (type == null) return false;
                    String t = type.toLowerCase();
                    if ("ETUDIANT".equalsIgnoreCase(role)) return t.contains("stage") || t.contains("pfe");
                    if ("CANDIDAT".equalsIgnoreCase(role)) return t.contains("emploi");
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Offre> searchOffres(String query, String type, String localisation, String secteur) {
        String q   = (query        != null && !query.trim().isEmpty())        ? query.trim()        : null;
        String t   = (type         != null && !type.trim().isEmpty())         ? type.trim()         : null;
        String loc = (localisation != null && !localisation.trim().isEmpty()) ? localisation.trim() : null;
        String sec = (secteur      != null && !secteur.trim().isEmpty())      ? secteur.trim()      : null;
        return offreRepository.searchOffres(q, t, loc, sec);
    }

    @Override
    public Offre ajouterOffre(Long entrepriseId, Offre offre) {
        Entreprise entreprise = entrepriseRepository.findById(entrepriseId)
                .orElseThrow(() -> new RuntimeException("Entreprise not found"));
        offre.setEntreprise(entreprise);
        return offreRepository.save(offre);
    }

    @Override
    public Offre getOffreById(Long id) {
        return offreRepository.findById(id).orElse(null);
    }

    @Override
    public Offre modifierOffre(Offre offre) {
        return offreRepository.save(offre);
    }

    @Override
    public Optional<Offre> afficheroffreById(Long id) {
        return offreRepository.findById(id);
    }

    @Override
    public List<Offre> getOffresByEntreprise(Long entrepriseId) {
        return offreRepository.findByEntrepriseId(entrepriseId);
    }

    @Override
    public Offre findById(Long offreId) {
        return offreRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre not found with id: " + offreId));
    }

    @Override
    public void deleteOffre(Long id) {
        offreRepository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getCategoriesAvecCount() {
        List<Object[]> results = offreRepository.countOffresByType();
        List<Map<String, Object>> categories = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", row[0]);
            map.put("nombreOffres", row[1]);
            categories.add(map);
        }
        return categories;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OFFRES PAR ÉTUDIANT — filtre secteur STRICT
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    public List<Offre> getOffresParEtudiant(Long etudiantId) {
        // Pour l'étudiant → filtre STAGE + secteur spécialité
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Set<String> domainesUtilisateur  = detecterDomaines(etudiant.getSpecialite());
        Set<String> secteursUtilisateur  = resoudreSecteurs(domainesUtilisateur);

        return offreRepository.findAll().stream()
                .filter(o -> {
                    String statut = o.getStatutValidation();
                    return statut == null || "VALIDEE".equalsIgnoreCase(statut);
                })
                .filter(o -> {
                    String type = o.getType();
                    if (type == null) return false;
                    return type.toLowerCase().contains("stage") || type.toLowerCase().contains("pfe");
                })
                // ✅ FIX PRINCIPAL : secteur null/blank → EXCLU (plus de "return true")
                .filter(o -> secteurMatchStrict(o, domainesUtilisateur, secteursUtilisateur))
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OFFRES PAR CANDIDAT — filtre secteur STRICT
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    public List<Offre> getOffresParCandidat(Long candidatId) {
        // Pour Candidat → filtre  domaine + secteur 
        Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat introuvable"));

        Set<String> domainesUtilisateur  = detecterDomaines(candidat.getSecteur());
        Set<String> secteursUtilisateur  = resoudreSecteurs(domainesUtilisateur);

        return offreRepository.findAll().stream()
                .filter(o -> {
                    String statut = o.getStatutValidation();
                    return statut == null || "VALIDEE".equalsIgnoreCase(statut);
                })
                .filter(o -> {
                    String type = o.getType();
                    if (type == null) return false;
                    return type.toLowerCase().contains("emploi");
                })
                // ✅ FIX PRINCIPAL : même filtre strict que pour l'étudiant
                .filter(o -> secteurMatchStrict(o, domainesUtilisateur, secteursUtilisateur))
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FILTRE SECTEUR STRICT (aligné avec RecommandationServiceImpl)
    // Retourne true UNIQUEMENT si le secteur de l'offre est dans le domaine
    // de l'utilisateur. Offres sans secteur → EXCLUES.
    // ═══════════════════════════════════════════════════════════════════════
    private boolean secteurMatchStrict(Offre offre, Set<String> domainesUtilisateur, Set<String> secteursUtilisateur) {
        if (domainesUtilisateur.isEmpty()) return false;

        String secteurOffre = offre.getSecteur();
        // ✅ Offre sans secteur → EXCLUE
        if (secteurOffre == null || secteurOffre.isBlank()) return false;

        Set<String> domainesOffre = detecterDomaines(secteurOffre);

        // Étape 1 : domaines directement identiques
        for (String d : domainesOffre) {
            if (domainesUtilisateur.contains(d)) return true;
        }

        // Étape 2 : secteurs résolus se croisent (via la map propre)
        Set<String> secteursOffre = resoudreSecteurs(domainesOffre);
        for (String s : secteursOffre) {
            if (secteursUtilisateur.contains(s)) return true;
        }

        // Étape 3 : tokens bruts du secteur de l'offre dans les secteurs utilisateur
        Set<String> tokensSecteursOffre = new HashSet<>(extraireMots(secteurOffre));
        for (String token : tokensSecteursOffre) {
            if (secteursUtilisateur.contains(token)) return true;
        }

        return false;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITAIRES
    // ═══════════════════════════════════════════════════════════════════════

    private Set<String> detecterDomaines(String texte) {
        if (texte == null || texte.isBlank()) return Collections.emptySet();
        Set<String> domaines = new LinkedHashSet<>();
        String norm = normalize(texte);

        if (DOMAINE_SECTEURS.containsKey(norm)) {
            domaines.add(norm);
            return domaines;
        }
        for (String mot : extraireMots(texte)) {
            if (DOMAINE_SECTEURS.containsKey(mot)) domaines.add(mot);
        }
        if (domaines.isEmpty()) {
            for (String cle : DOMAINE_SECTEURS.keySet()) {
                if (norm.contains(cle)) {
                    domaines.add(cle);
                    break;
                }
            }
        }
        return domaines;
    }

    private Set<String> resoudreSecteurs(Set<String> domaines) {
        Set<String> secteurs = new LinkedHashSet<>();
        for (String d : domaines) {
            List<String> s = DOMAINE_SECTEURS.get(d);
            if (s != null) secteurs.addAll(s);
        }
        return secteurs;
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
    public Offre updateOffre(Long id, Offre updatedOffre) {
        Offre existing = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        existing.setTitre(updatedOffre.getTitre());
        existing.setType(updatedOffre.getType());
        existing.setDateExpiration(updatedOffre.getDateExpiration());
        existing.setDescription(updatedOffre.getDescription());
        existing.setTime(updatedOffre.getTime());
        existing.setLocalisation(updatedOffre.getLocalisation());
        existing.setSecteur(updatedOffre.getSecteur());

        if (updatedOffre.getImage() != null) {
            existing.setImage(updatedOffre.getImage());
        }

        return offreRepository.save(existing);
    }
}