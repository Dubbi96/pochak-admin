package com.pochak.commerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
        scanBasePackages = {"com.pochak.commerce", "com.pochak.common"}
)
@EnableScheduling
public class PochakCommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakCommerceApplication.class, args);
    }
}
