package com.pochak.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PochakAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakAdminApplication.class, args);
    }
}
