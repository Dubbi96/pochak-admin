package com.pochak.operation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        scanBasePackages = {"com.pochak.operation", "com.pochak.common"}
)
public class PochakOperationApplication {

    public static void main(String[] args) {
        SpringApplication.run(PochakOperationApplication.class, args);
    }
}
