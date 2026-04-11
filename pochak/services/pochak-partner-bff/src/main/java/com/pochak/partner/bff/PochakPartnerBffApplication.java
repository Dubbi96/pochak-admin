package com.pochak.partner.bff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        scanBasePackages = {"com.pochak.partner.bff", "com.pochak.common"}
)
public class PochakPartnerBffApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakPartnerBffApplication.class, args);
    }
}
