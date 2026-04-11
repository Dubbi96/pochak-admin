package com.pochak.content;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        scanBasePackages = {"com.pochak.content", "com.pochak.common"}
)
public class PochakContentApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakContentApplication.class, args);
    }
}
