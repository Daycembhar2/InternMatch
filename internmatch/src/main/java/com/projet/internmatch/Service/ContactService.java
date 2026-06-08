package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.entity.Contact;

import java.util.List;

public interface ContactService {
    Contact ajoutmessage (Contact contact);
    void supprimercontact(Long id);
    List<Contact> consultermessage();

    List<Contact> getContact();
}
