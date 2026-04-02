package com.pochak.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class PochakGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakGatewayApplication.class, args);
    }
}
