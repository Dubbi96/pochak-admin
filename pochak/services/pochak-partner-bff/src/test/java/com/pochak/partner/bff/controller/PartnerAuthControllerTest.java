package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class PartnerAuthControllerTest {

    private PartnerAuthController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerAuthController();
    }

    @Test
    @DisplayName("getMyPartnerInfo should return 501 NOT_IMPLEMENTED")
    void getMyPartnerInfo_notImplemented() {
        ResponseEntity<String> result = controller.getMyPartnerInfo();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_IMPLEMENTED);
        assertThat(result.getBody()).contains("NOT_IMPLEMENTED");
    }

    @Test
    @DisplayName("register should return 501 NOT_IMPLEMENTED")
    void register_notImplemented() {
        ResponseEntity<String> result = controller.register("{\"name\":\"partner\"}");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_IMPLEMENTED);
        assertThat(result.getBody()).contains("NOT_IMPLEMENTED");
    }
}
