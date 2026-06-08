package com.projet.internmatch.Service;

import com.projet.internmatch.Repository.AdminRepository;
import com.projet.internmatch.Repository.ContactRepository;
import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.entity.Contact;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactServiceImpl implements ContactService {
    @Autowired
    ContactRepository contactRepository;
    @Autowired
    EmailService emailService;

    @Override
    public void supprimercontact(Long id) {

    }

    @Override
    public List<Contact> consultermessage() {
        return List.of();
    }

    @Override
    public List<Contact> getContact() {
        return contactRepository.findAll();
    }
    public Contact ajoutmessage(Contact contact) {
        Contact saved = contactRepository.save(contact);

        // Email à l'administrateur
        String adminEmail = "daycembhar9@gmail.com"; // ← ton email admin
        String sujet = "📩 Nouveau message de contact : " + contact.getSubject();
        String corps = """
                Nouveau message reçu via le formulaire de contact :
                
                Nom     : %s
                Email   : %s
                Sujet   : %s
                Message : %s
                """.formatted(
                contact.getNom(),
                contact.getEmail(),
                contact.getSubject(),
                contact.getComments()
        );

        emailService.SendSimpleMessage(adminEmail, sujet, corps);

        return saved;
    }
}
