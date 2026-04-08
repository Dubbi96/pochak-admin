package com.pochak.identity.partner.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.identity.partner.dto.PartnerResponse;
import com.pochak.identity.partner.dto.RegisterPartnerRequest;
import com.pochak.identity.partner.entity.Partner;
import com.pochak.identity.partner.entity.PartnerStatus;
import com.pochak.identity.partner.repository.PartnerRepository;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PartnerServiceTest {

    @InjectMocks
    private PartnerService partnerService;

    @Mock
    private PartnerRepository partnerRepository;

    @Mock
    private UserRepository userRepository;

    private User testUser;
    private Partner testPartner;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(50L)
                .nickname("testpartner")
                .email("partner@pochak.co.kr")
                .name("테스트 파트너")
                .role(User.UserRole.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        testPartner = Partner.builder()
                .id(1L)
                .userId(50L)
                .businessName("포착 스포츠")
                .businessNumber("123-45-67890")
                .contactPhone("02-1234-5678")
                .bankAccount("110-123-456789")
                .bankName("국민은행")
                .commissionRate(new BigDecimal("10.00"))
                .status(PartnerStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should register a partner successfully")
    void testRegister() {
        // given
        RegisterPartnerRequest request = RegisterPartnerRequest.builder()
                .businessName("포착 스포츠")
                .businessNumber("123-45-67890")
                .contactPhone("02-1234-5678")
                .bankAccount("110-123-456789")
                .bankName("국민은행")
                .build();

        given(partnerRepository.existsByUserId(50L)).willReturn(false);
        given(partnerRepository.existsByBusinessNumber("123-45-67890")).willReturn(false);
        given(userRepository.findById(50L)).willReturn(Optional.of(testUser));
        given(partnerRepository.save(any(Partner.class))).willReturn(testPartner);

        // when
        PartnerResponse result = partnerService.register(50L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getBusinessName()).isEqualTo("포착 스포츠");
        assertThat(result.getStatus()).isEqualTo(PartnerStatus.PENDING);
    }

    @Test
    @DisplayName("Should reject duplicate partner registration")
    void testRegister_duplicate() {
        // given
        RegisterPartnerRequest request = RegisterPartnerRequest.builder()
                .businessName("중복 업체")
                .businessNumber("999-99-99999")
                .contactPhone("010-0000-0000")
                .build();

        given(partnerRepository.existsByUserId(50L)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> partnerService.register(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    @DisplayName("Should reject duplicate business number")
    void testRegister_duplicateBusinessNumber() {
        // given
        RegisterPartnerRequest request = RegisterPartnerRequest.builder()
                .businessName("다른 업체")
                .businessNumber("123-45-67890")
                .contactPhone("010-0000-0000")
                .build();

        given(partnerRepository.existsByUserId(50L)).willReturn(false);
        given(partnerRepository.existsByBusinessNumber("123-45-67890")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> partnerService.register(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Business number already registered");
    }

    @Test
    @DisplayName("Should get partner info by userId")
    void testGetMyPartnerInfo() {
        // given
        given(partnerRepository.findByUserId(50L)).willReturn(Optional.of(testPartner));

        // when
        PartnerResponse result = partnerService.getMyPartnerInfo(50L);

        // then
        assertThat(result.getUserId()).isEqualTo(50L);
        assertThat(result.getBusinessName()).isEqualTo("포착 스포츠");
    }

    @Test
    @DisplayName("Should throw when partner not found")
    void testGetMyPartnerInfo_notFound() {
        // given
        given(partnerRepository.findByUserId(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> partnerService.getMyPartnerInfo(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Partner not found");
    }

    @Test
    @DisplayName("Should approve a pending partner and update user role")
    void testApprove() {
        // given
        given(partnerRepository.findById(1L)).willReturn(Optional.of(testPartner));
        given(userRepository.findById(50L)).willReturn(Optional.of(testUser));

        // when
        PartnerResponse result = partnerService.approve(1L);

        // then
        assertThat(result.getStatus()).isEqualTo(PartnerStatus.ACTIVE);
        assertThat(testPartner.getApprovedAt()).isNotNull();
        assertThat(testUser.getRole()).isEqualTo(User.UserRole.PARTNER);
    }

    @Test
    @DisplayName("Should reject approval of non-pending partner")
    void testApprove_invalidStatus() {
        // given
        Partner activePartner = Partner.builder()
                .id(2L)
                .userId(60L)
                .businessName("이미 승인된 업체")
                .businessNumber("222-22-22222")
                .contactPhone("010-2222-2222")
                .status(PartnerStatus.ACTIVE)
                .build();

        given(partnerRepository.findById(2L)).willReturn(Optional.of(activePartner));

        // when & then
        assertThatThrownBy(() -> partnerService.approve(2L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("PENDING");
    }
}
