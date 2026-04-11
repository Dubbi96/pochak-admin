package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PartnerAnalyticsControllerTest {

    private PartnerAnalyticsController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerAnalyticsController();
    }

    @Test
    @DisplayName("getRevenue should throw when downstream API is not implemented")
    void getRevenue_notImplemented() {
        assertThatThrownBy(() -> controller.getRevenue(1L, null, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not implemented");
    }

    @Test
    @DisplayName("getReservationStats should throw when downstream API is not implemented")
    void getReservationStats_notImplemented() {
        assertThatThrownBy(() -> controller.getReservationStats(1L, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not implemented");
    }
}
