package com.projet.internmatch.Service;

import com.projet.internmatch.entity.Admin;
import com.projet.internmatch.entity.Utilisateur;
import com.projet.internmatch.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class AdminServiceImpl implements AdminService{
    @Autowired
    AdminRepository adminRepository;
    @Override
    public Admin ajoutadmin(Admin admin) {
        return adminRepository.save(admin);//admin = les attributs les données mt3y ly bech nssayvihom
    }

    @Override
    public Admin modifieradmin(Admin admin) {
        return adminRepository.save(admin);
    }

    @Override
    public List<Admin> getAdmin() {
        return adminRepository.findAll();
    }

    @Override
    public void supprimeradmin(Long id) {
        adminRepository.deleteById(id);
    }

    @Override
    public Optional<Admin> afficheradminById(Long id) {
        return adminRepository.findById(id);
    }

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
    @Override
    public long countAdmins() {
        return adminRepository.count();           // le plus simple et fiable
        // ou : return adminRepository.countByRoleAdminIsNotNull(); si tu veux filtrer
    }
}
