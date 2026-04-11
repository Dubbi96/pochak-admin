package com.pochak.identity;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    @Test
    void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("Pochak2026!");
        System.out.println("Generated hash: " + hash);
        
        String existing2b = "$2b$10$edMHq3tU2zvI0/GmiXfyKugvySszi3naUYk7rpa2xrdYqhXtGVxSi";
        System.out.println("Existing $2b matches 'Pochak2026!': " + encoder.matches("Pochak2026!", existing2b));
        
        // Also test admin1234!
        String adminHash = encoder.encode("admin1234!");
        System.out.println("admin1234! hash: " + adminHash);
    }
}
