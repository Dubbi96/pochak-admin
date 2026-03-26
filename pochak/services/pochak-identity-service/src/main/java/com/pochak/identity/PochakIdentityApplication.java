package com.pochak.identity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
        exclude = {UserDetailsServiceAutoConfiguration.class},
        scanBasePackages = {"com.pochak.identity", "com.pochak.common"}
)
@EnableScheduling
public class PochakIdentityApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakIdentityApplication.class, args);
    }
}
