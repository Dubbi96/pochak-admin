package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContext;
import com.pochak.common.security.UserContextHolder;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.dto.WebPlayerResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WebPlayerControllerTest {

    @Mock
    private ContentServiceClient contentClient;
    @Mock
    private CommerceServiceClient commerceClient;

    @InjectMocks
    private WebPlayerController webPlayerController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        UserContextHolder.set(UserContext.builder().userId(100L).role("USER").build());
    }

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("Should return player data when access is granted")
    void testGetPlayerAccessGranted() {
        // given
        ObjectNode playerData = objectMapper.createObjectNode();
        ObjectNode playerDataInner = objectMapper.createObjectNode();
        playerDataInner.put("streamUrl", "rtmp://example.com/live");
        playerData.set("data", playerDataInner);

        ObjectNode accessData = objectMapper.createObjectNode();
        ObjectNode accessInner = objectMapper.createObjectNode();
        accessInner.put("granted", true);
        accessData.set("data", accessInner);

        given(contentClient.getPlayerData("live", "1")).willReturn(playerData);
        given(contentClient.checkAccess("live", "1", 100L)).willReturn(accessData);

        // when
        ApiResponse<WebPlayerResponse> response = webPlayerController.getPlayer("live", "1");

        // then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().isAccessGranted()).isTrue();
        assertThat(response.getData().getPlayerData()).isNotNull();
        assertThat(response.getData().getAccessDeniedReason()).isNull();
        assertThat(response.getData().getProductSuggestions()).isNull();
    }

    @Test
    @DisplayName("Should return denied reason and product suggestions when access is denied")
    void testGetPlayerAccessDenied() {
        // given
        ObjectNode playerData = objectMapper.createObjectNode();
        playerData.set("data", objectMapper.createObjectNode());

        ObjectNode accessData = objectMapper.createObjectNode();
        ObjectNode accessInner = objectMapper.createObjectNode();
        accessInner.put("granted", false);
        accessInner.put("reason", "Subscription required");
        accessData.set("data", accessInner);

        ObjectNode suggestions = objectMapper.createObjectNode();
        suggestions.put("data", "product-list");

        given(contentClient.getPlayerData("vod", "5")).willReturn(playerData);
        given(contentClient.checkAccess("vod", "5", 100L)).willReturn(accessData);
        given(commerceClient.getProductSuggestions("vod", "5")).willReturn(suggestions);

        // when
        ApiResponse<WebPlayerResponse> response = webPlayerController.getPlayer("vod", "5");

        // then
        assertThat(response.getData().isAccessGranted()).isFalse();
        assertThat(response.getData().getPlayerData()).isNull();
        assertThat(response.getData().getAccessDeniedReason()).isEqualTo("Subscription required");
        assertThat(response.getData().getProductSuggestions()).isNotNull();
    }

    @Test
    @DisplayName("Should handle null access data as denied")
    void testGetPlayerNullAccessData() {
        // given
        given(contentClient.getPlayerData("live", "1")).willReturn(null);
        given(contentClient.checkAccess("live", "1", 100L)).willReturn(null);
        given(commerceClient.getProductSuggestions("live", "1")).willReturn(null);

        // when
        ApiResponse<WebPlayerResponse> response = webPlayerController.getPlayer("live", "1");

        // then
        assertThat(response.getData().isAccessGranted()).isFalse();
        assertThat(response.getData().getAccessDeniedReason()).isEqualTo("Service unavailable");
    }
}
