package com.projet.internmatch.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class EmailServiceImpl implements EmailService {
    @Autowired
    private JavaMailSender emailSender;

    @Override
    public boolean SendSimpleMessage(String to, String subject, String text) {
        System.out.println("[EMAIL DEBUG] Tentative d'envoi d'email à: " + to);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("daycembhar3@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        try {
            System.out.println("[EMAIL DEBUG] Initialisation du message:");
            System.out.println("  - To: " + to);
            System.out.println("  - Subject: " + subject);
            System.out.println("  - From: daycembhar3@gmail.com");

            System.out.println("[EMAIL DEBUG] JavaMailSender disponible: " + (emailSender != null));

            emailSender.send(message);

            log.info("✓ Email envoyé avec succès à: {}", to);
            System.out.println("✓ SUCCESS: Email envoyé à " + to);
            return true;

        } catch (MailException e) {
            System.err.println("✗ MAIL EXCEPTION lors de l'envoi à " + to);
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Cause: " + e.getCause());
            log.error("✗ ERREUR lors de l'envoi d'email à {}: {}", to, e.getMessage(), e);
            e.printStackTrace();
            return false;

        } catch (Exception e) {
            System.err.println("✗ EXCEPTION INATTENDUE lors de l'envoi à " + to);
            System.err.println("  Type: " + e.getClass().getName());
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Cause: " + e.getCause());
            log.error("✗ ERREUR INATTENDUE lors de l'envoi d'email à {}: {}", to, e.getMessage(), e);
            e.printStackTrace();
            return false;
        }
    }
    @Override
    public boolean sendEmailWithAttachment(String to, String subject, String text,
                                           byte[] attachmentBytes, String attachmentFilename) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("daycembhar3@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            helper.addAttachment(attachmentFilename, new ByteArrayResource(attachmentBytes));

            emailSender.send(message);
            log.info("✓ Email avec pièce jointe envoyé à: {}", to);
            return true;

        } catch (Exception e) {
            log.error("✗ Erreur envoi email avec pièce jointe à {}: {}", to, e.getMessage(), e);
            return false;
        }
    }
}
