package com.projet.internmatch.Service;

import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements
AuthService{
    @Override
    public boolean authenticate(String email, String mdp) {
        return false;
    }
}
