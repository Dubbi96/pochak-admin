package com.pochak.common.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserContextTest {

    @Test
    @DisplayName("Should return true for admin role (case-insensitive)")
    void testIsAdminTrue() {
        UserContext ctx = UserContext.builder().userId(1L).role("ADMIN").build();
        assertThat(ctx.isAdmin()).isTrue();
    }

    @Test
    @DisplayName("Should return true for admin role lowercase")
    void testIsAdminLowerCase() {
        UserContext ctx = UserContext.builder().userId(1L).role("admin").build();
        assertThat(ctx.isAdmin()).isTrue();
    }

    @Test
    @DisplayName("Should return false for non-admin role")
    void testIsAdminFalseForUser() {
        UserContext ctx = UserContext.builder().userId(1L).role("USER").build();
        assertThat(ctx.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should return false when role is null")
    void testIsAdminNullRole() {
        UserContext ctx = UserContext.builder().userId(1L).role(null).build();
        assertThat(ctx.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should build with all fields")
    void testBuilder() {
        UserContext ctx = UserContext.builder().userId(99L).role("MANAGER").build();
        assertThat(ctx.getUserId()).isEqualTo(99L);
        assertThat(ctx.getRole()).isEqualTo("MANAGER");
    }
}
