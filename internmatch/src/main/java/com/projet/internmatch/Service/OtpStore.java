package com.projet.internmatch.Service;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private record OtpEntry(String otp, LocalDateTime expiry) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public void save(String email, String otp) {
        store.put(email, new OtpEntry(otp, LocalDateTime.now().plusMinutes(10)));
    }

    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            store.remove(email);
            return false;
        }
        boolean valid = entry.otp().equals(otp);
        if (valid) store.remove(email); // OTP usage unique
        return valid;
    }
}