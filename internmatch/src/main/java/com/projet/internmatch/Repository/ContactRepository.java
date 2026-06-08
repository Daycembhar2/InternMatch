package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact,Long> {

}
