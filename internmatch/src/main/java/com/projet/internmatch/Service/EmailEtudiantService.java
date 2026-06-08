package com.projet.internmatch.Service;

import jakarta.mail.internet.MimeMessage;

public interface EmailEtudiantService {
    public MimeMessage createMimeMessage();
    public void SendEmail(MimeMessage message) ;

}
