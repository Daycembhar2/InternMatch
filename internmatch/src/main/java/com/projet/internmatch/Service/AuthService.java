package com.projet.internmatch.Service;

import org.springframework.stereotype.Service;

@Service
public interface AuthService {
        boolean authenticate(String email, String mdp);
    }

