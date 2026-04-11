package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContext;
import com.pochak.common.security.UserContextHolder;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.client.IdentityServiceClient;
import com.pochak.web.bff.dto.WebMyPageResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class WebMyPageControllerTest {

    @Mock
    private IdentityServiceClient identityClient;
    @Mock
    private ContentServiceClient contentClient;
    @Mock
    private CommerceServiceClient commerceClient;

    @InjectMocks
    private WebMyPageController webMyPageController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("Should return my page data when user is authenticated")
    void testGetMyPageAuthenticated() {
        // given
        UserContextHolder.set(UserContext.builder().userId(42L).role("USER").build());

        ObjectNode profile = objectMapper.createObjectNode();
        profile.put("name", "TestUser");
        ObjectNode history = objectMapper.createObjectNode();
        ObjectNode favorites = objectMapper.createObjectNode();
        ObjectNode wallet = objectMapper.createObjectNode();
        wallet.put("balance", 5000);
        ObjectNode entitlements = objectMapper.createObjectNode();

        given(identityClient.getCurrentUser(42L)).willReturn(profile);
        given(contentClient.getWatchHistory(42L, 10)).willReturn(history);
        given(contentClient.getFavorites(42L, 10)).willReturn(favorites);
        given(commerceClient.getWallet(42L)).willReturn(wallet);
        given(commerceClient.getEntitlements(42L)).willReturn(entitlements);

        // when
        ApiResponse<WebMyPageResponse> response = webMyPageController.getMyPage();

        // then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isNotNull();
        assertThat(response.getData().getUserProfile()).isNotNull();
        assertThat(response.getData().getWatchHistory()).isNotNull();
        assertThat(response.getData().getFavorites()).isNotNull();
        assertThat(response.getData().getWallet()).isNotNull();
        assertThat(response.getData().getEntitlements()).isNotNull();
    }

    @Test
    @DisplayName("Should return unauthorized error when user is not authenticated")
    void testGetMyPageUnauthenticated() {
        // given - no user context set

        // when
        ApiResponse<WebMyPageResponse> response = webMyPageController.getMyPage();

        // then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getError()).isNotNull();
        assertThat(response.getError().getCode()).isEqualTo("UNAUTHORIZED");
    }
}
