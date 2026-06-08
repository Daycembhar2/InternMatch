package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Admin;

import java.util.List;
import java.util.Optional;

public interface AdminService extends UtilisateurService {
    Admin ajoutadmin (Admin admin);
    Admin modifieradmin (Admin admin);
    List<Admin> getAdmin() ;
    void supprimeradmin(Long id);
    Optional<Admin> afficheradminById(Long id);
    long countAdmins();
}
