package com.pochak.common.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserContextHolderTest {

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("Should store and retrieve user context")
    void testSetAndGet() {
        // given
        UserContext context = UserContext.builder().userId(1L).role("USER").build();

        // when
        UserContextHolder.set(context);

        // then
        assertThat(UserContextHolder.get()).isNotNull();
        assertThat(UserContextHolder.get().getUserId()).isEqualTo(1L);
        assertThat(UserContextHolder.get().getRole()).isEqualTo("USER");
    }

    @Test
    @DisplayName("Should return null userId when no context is set")
    void testGetUserIdWhenEmpty() {
        assertThat(UserContextHolder.getUserId()).isNull();
    }

    @Test
    @DisplayName("Should return null role when no context is set")
    void testGetRoleWhenEmpty() {
        assertThat(UserContextHolder.getRole()).isNull();
    }

    @Test
    @DisplayName("Should return userId from stored context")
    void testGetUserId() {
        // given
        UserContextHolder.set(UserContext.builder().userId(42L).role("ADMIN").build());

        // when / then
        assertThat(UserContextHolder.getUserId()).isEqualTo(42L);
    }

    @Test
    @DisplayName("Should return role from stored context")
    void testGetRole() {
        // given
        UserContextHolder.set(UserContext.builder().userId(42L).role("ADMIN").build());

        // when / then
        assertThat(UserContextHolder.getRole()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Should clear context after clear() is called")
    void testClear() {
        // given
        UserContextHolder.set(UserContext.builder().userId(1L).role("USER").build());

        // when
        UserContextHolder.clear();

        // then
        assertThat(UserContextHolder.get()).isNull();
        assertThat(UserContextHolder.getUserId()).isNull();
    }
}
