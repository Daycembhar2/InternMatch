package com.projet.internmatch.Service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.projet.internmatch.entity.Candidature;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;

@Service
public class PDFService {

    public byte[] genererLettreAffectation(Candidature candidature) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont fontNormal = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // ── EN-TÊTE INSTITUTION ──────────────────────────────────────
        String nomFaculte = candidature.getEtudiant().getInstitution() != null
                ? candidature.getEtudiant().getInstitution().getNomFaculte()
                : "Institution";

        document.add(new Paragraph(nomFaculte)
                .setFont(fontBold)
                .setFontSize(16)
                .setFontColor(ColorConstants.DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("Lettre d'Affectation de Stage")
                .setFont(fontBold)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10));

        // ── LIGNE DE SÉPARATION ──────────────────────────────────────
        document.add(new Paragraph("─────────────────────────────────────────")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY));

        // ── INFOS ÉTUDIANT ───────────────────────────────────────────
        String nomComplet = candidature.getEtudiant().getPrenom()
                + " " + candidature.getEtudiant().getNom();

        String codeEtudiant = candidature.getEtudiant().getId() != null
                ? candidature.getEtudiant().getId().toString()
                : "N/A";

        String specialite = candidature.getEtudiant().getSpecialite() != null
                ? candidature.getEtudiant().getSpecialite()
                : "N/A";

        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginTop(20);

        table.addCell(cellLabel("Nom & Prénom :", fontBold));
        table.addCell(cellValue(nomComplet, fontNormal));

        table.addCell(cellLabel("Code étudiant :", fontBold));
        table.addCell(cellValue(codeEtudiant, fontNormal));

        table.addCell(cellLabel("Spécialité / Filière :", fontBold));
        table.addCell(cellValue(specialite, fontNormal));

        // ── INFOS STAGE ──────────────────────────────────────────────
        String entreprise = candidature.getOffre().getEntreprise() != null
                ? candidature.getOffre().getEntreprise().getNom()
                : "N/A";



        table.addCell(cellLabel("Entreprise d'accueil :", fontBold));
        table.addCell(cellValue(entreprise, fontNormal));



        document.add(table);

        // ── CORPS DU TEXTE ───────────────────────────────────────────
        document.add(new Paragraph(
                "\nNous avons l'honneur d'informer l'entreprise " + entreprise +
                        " que l'étudiant(e) " + nomComplet +
                        ", inscrit(e) en " + specialite +
                        ", est affecté(e) pour effectuer son stage du " +

                        "\n\nNous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.")
                .setFont(fontNormal)
                .setFontSize(11)
                .setMarginTop(20)
                .setTextAlignment(TextAlignment.JUSTIFIED));

        // ── SIGNATURE ────────────────────────────────────────────────
        String responsable = candidature.getEtudiant().getInstitution() != null
                ? candidature.getEtudiant().getInstitution().getNom()
                + " " + candidature.getEtudiant().getInstitution().getPrenom()
                : "Le Responsable Académique";

        document.add(new Paragraph("\n\nLe Responsable Académique")
                .setFont(fontBold)
                .setTextAlignment(TextAlignment.RIGHT));

        document.add(new Paragraph(responsable)
                .setFont(fontNormal)
                .setTextAlignment(TextAlignment.RIGHT));

        document.close();
        return baos.toByteArray();
    }

    // ── HELPERS CELLULES TABLE ───────────────────────────────────────
    private Cell cellLabel(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(11))
                .setBorder(null)
                .setPaddingBottom(6);
    }

    private Cell cellValue(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(11))
                .setBorder(null)
                .setPaddingBottom(6);
    }
}