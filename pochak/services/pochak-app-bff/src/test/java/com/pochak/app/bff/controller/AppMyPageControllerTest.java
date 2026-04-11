package com.pochak.app.bff.controller;

import com.pochak.app.bff.client.CommerceServiceClient;
import com.pochak.app.bff.client.ContentServiceClient;
import com.pochak.app.bff.client.IdentityServiceClient;
import com.pochak.common.security.UserContext;
import com.pochak.common.security.UserContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppMyPageController.class)
class AppMyPageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IdentityServiceClient identityClient;

    @MockBean
    private CommerceServiceClient commerceClient;

    @MockBean
    private ContentServiceClient contentClient;

    private final ObjectMapper mapper = new ObjectMapper();
    private static final Long USER_ID = 42L;

    @BeforeEach
    void setUp() {
        UserContextHolder.set(UserContext.builder().userId(USER_ID).role("USER").build());
    }

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("GET /mypage - 모든 서비스 호출 성공 시 전체 데이터 반환")
    void getMyPage_allServicesOk() throws Exception {
        ObjectNode profile = mapper.createObjectNode().put("nickname", "tester");
        ObjectNode guardian = mapper.createObjectNode().put("name", "guardian1");
        ObjectNode wallet = mapper.createObjectNode().put("balance", 1000);
        ObjectNode watchHistory = mapper.createObjectNode().put("total", 5);
        ObjectNode favorites = mapper.createObjectNode().put("total", 3);

        when(identityClient.getCurrentUser(USER_ID)).thenReturn(profile);
        when(identityClient.getMyGuardian(USER_ID)).thenReturn(guardian);
        when(commerceClient.getWallet(USER_ID)).thenReturn(wallet);
        when(contentClient.getWatchHistory(USER_ID, 10)).thenReturn(watchHistory);
        when(contentClient.getFavorites(USER_ID, 10)).thenReturn(favorites);

        mockMvc.perform(get("/mypage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userProfile.nickname").value("tester"))
                .andExpect(jsonPath("$.data.guardianInfo.name").value("guardian1"))
                .andExpect(jsonPath("$.data.wallet.balance").value(1000))
                .andExpect(jsonPath("$.data.watchHistory.total").value(5))
                .andExpect(jsonPath("$.data.favorites.total").value(3));

        verify(contentClient).getWatchHistory(USER_ID, 10);
        verify(contentClient).getFavorites(USER_ID, 10);
    }

    @Test
    @DisplayName("GET /mypage - Content 서비스 실패 시 나머지 정상 반환 (watchHistory/favorites null)")
    void getMyPage_contentServiceFails_otherFieldsStillReturned() throws Exception {
        ObjectNode profile = mapper.createObjectNode().put("nickname", "tester");
        ObjectNode guardian = mapper.createObjectNode().put("name", "guardian1");
        ObjectNode wallet = mapper.createObjectNode().put("balance", 500);

        when(identityClient.getCurrentUser(USER_ID)).thenReturn(profile);
        when(identityClient.getMyGuardian(USER_ID)).thenReturn(guardian);
        when(commerceClient.getWallet(USER_ID)).thenReturn(wallet);
        when(contentClient.getWatchHistory(USER_ID, 10)).thenReturn(null);
        when(contentClient.getFavorites(USER_ID, 10)).thenReturn(null);

        mockMvc.perform(get("/mypage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userProfile.nickname").value("tester"))
                .andExpect(jsonPath("$.data.wallet.balance").value(500))
                .andExpect(jsonPath("$.data.watchHistory").doesNotExist())
                .andExpect(jsonPath("$.data.favorites").doesNotExist());
    }

    @Test
    @DisplayName("GET /mypage - Identity 서비스 실패해도 Content/Commerce 정상 반환")
    void getMyPage_identityFails_otherFieldsStillReturned() throws Exception {
        ObjectNode wallet = mapper.createObjectNode().put("balance", 300);
        ObjectNode watchHistory = mapper.createObjectNode().put("total", 2);
        ObjectNode favorites = mapper.createObjectNode().put("total", 1);

        when(identityClient.getCurrentUser(USER_ID)).thenReturn(null);
        when(identityClient.getMyGuardian(USER_ID)).thenReturn(null);
        when(commerceClient.getWallet(USER_ID)).thenReturn(wallet);
        when(contentClient.getWatchHistory(USER_ID, 10)).thenReturn(watchHistory);
        when(contentClient.getFavorites(USER_ID, 10)).thenReturn(favorites);

        mockMvc.perform(get("/mypage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userProfile").doesNotExist())
                .andExpect(jsonPath("$.data.wallet.balance").value(300))
                .andExpect(jsonPath("$.data.watchHistory.total").value(2))
                .andExpect(jsonPath("$.data.favorites.total").value(1));
    }

    @Test
    @DisplayName("GET /mypage - 미인증 사용자는 에러 반환")
    void getMyPage_unauthorized() throws Exception {
        UserContextHolder.clear();

        mockMvc.perform(get("/mypage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(identityClient, commerceClient, contentClient);
    }
}
