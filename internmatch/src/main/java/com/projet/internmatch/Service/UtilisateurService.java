package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Utilisateur;


import java.util.List;


public interface UtilisateurService {
    Utilisateur addUtilisateur(Utilisateur utilisateur);
    Utilisateur authentifier (String email , String mdp);

    List<Utilisateur> findAll();

   /* Optional<Utilisateur> findById(Long id);           // ← Optional ou Utilisateur directement

    Optional<Utilisateur> update(Long id, Utilisateur utilisateurDetails);  // ← idem

    boolean deleteById(Long id);*/
}
