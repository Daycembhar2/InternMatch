package com.projet.internmatch.RestController;

import com.projet.internmatch.Repository.ContactRepository;
import com.projet.internmatch.Service.ContactService;
import com.projet.internmatch.entity.Contact;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController // ray l classe hethy bech tahki aa bd mt3y hiya ly fiha les requetes mt3y
@RequestMapping(value= "/contact")
@CrossOrigin("*")
public class ContactRestController {
    @Autowired
    ContactRepository contactRepository;
    @Autowired
    ContactService contactService;
    @RequestMapping(method = RequestMethod.POST)
    public Contact ajoutercontact(@RequestBody Contact contact ){

        return contactService.ajoutmessage(contact);
    }
    @GetMapping
    public List<Contact> AfficherContact(){
        return contactService.getContact();
    }

    

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void SupprimerContact(@PathVariable("id") Long id){
        contactService.supprimercontact(id);

    }
}
