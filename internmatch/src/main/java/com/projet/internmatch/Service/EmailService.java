package com.projet.internmatch.Service;

public interface EmailService {
    public boolean SendSimpleMessage(String to, String subject, String text);
    boolean sendEmailWithAttachment(String to, String subject, String text,
                                    byte[] attachmentBytes, String attachmentFilename);

}
