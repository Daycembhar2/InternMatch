package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Utilisateur;

import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class UtilisateurServiceImpl implements UtilisateurService{
    @Override
    public Utilisateur addUtilisateur(Utilisateur utilisateur) {
        return null;
    }

    @Override
    public Utilisateur authentifier(String email, String mdp) {
        return null;
    }


    @Override
    public List<Utilisateur> findAll() {
        return List.of();
    }
}
