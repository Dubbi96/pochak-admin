package com.pochak.identity.guardian.service;

import com.pochak.identity.guardian.dto.GuardianResponseDto;
import com.pochak.identity.guardian.entity.GuardianRelationship;
import com.pochak.identity.guardian.entity.GuardianRelationship.ConsentMethod;
import com.pochak.identity.guardian.entity.GuardianRelationship.GuardianStatus;
import com.pochak.identity.guardian.repository.GuardianRelationshipRepository;
import com.pochak.identity.user.entity.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GuardianServiceTest {

    @Mock
    private GuardianRelationshipRepository guardianRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private GuardianService guardianService;

    // ==================== requestGuardian ====================

    @Nested
    @DisplayName("requestGuardian - 보호자 연결 요청")
    class RequestGuardian {

        private User createMinor(Long id) {
            return User.builder()
                    .id(id)
                    .email("minor" + id + "@test.com")
                    .nickname("minor" + id)
                    .birthDate(LocalDate.now().minusYears(10)) // 10세 미성년자
                    .build();
        }

        @Test
        @DisplayName("기존 관계 없는 미성년자에 대한 보호자 요청 - 성공")
        void shouldSucceedWhenNoExistingRelationship() {
            // given
            Long guardianId = 1L;
            Long minorId = 10L;
            User minor = createMinor(minorId);

            given(guardianRepository.existsByGuardianIdAndMinorIdAndStatusNot(
                    guardianId, minorId, GuardianStatus.REVOKED)).willReturn(false);
            given(entityManager.find(User.class, minorId)).willReturn(minor);
            given(guardianRepository.save(any(GuardianRelationship.class)))
                    .willAnswer(inv -> inv.getArgument(0));

            // when
            GuardianResponseDto result = guardianService.requestGuardian(guardianId, minorId, ConsentMethod.PASS_AUTH);

            // then
            assertThat(result).isNotNull();
            verify(guardianRepository).save(any(GuardianRelationship.class));
        }

        @Test
        @DisplayName("이미 활성 관계가 있는 경우 - 실패")
        void shouldFailWhenRelationshipAlreadyExists() {
            // given
            Long guardianId = 1L;
            Long minorId = 11L;

            given(guardianRepository.existsByGuardianIdAndMinorIdAndStatusNot(
                    guardianId, minorId, GuardianStatus.REVOKED)).willReturn(true);

            // when & then
            assertThatThrownBy(() ->
                    guardianService.requestGuardian(guardianId, minorId, ConsentMethod.PASS_AUTH))
                    .isInstanceOf(IllegalStateException.class);

            verify(guardianRepository, never()).save(any());
        }

        @Test
        @DisplayName("미성년자를 찾을 수 없는 경우 - 실패")
        void shouldFailWhenMinorNotFound() {
            // given
            Long guardianId = 1L;
            Long minorId = 12L;

            given(guardianRepository.existsByGuardianIdAndMinorIdAndStatusNot(
                    guardianId, minorId, GuardianStatus.REVOKED)).willReturn(false);
            given(entityManager.find(User.class, minorId)).willReturn(null);

            // when & then
            assertThatThrownBy(() ->
                    guardianService.requestGuardian(guardianId, minorId, ConsentMethod.PASS_AUTH))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(guardianRepository, never()).save(any());
        }

        @Test
        @DisplayName("14세 이상 사용자에 대한 보호자 요청 - 실패")
        void shouldFailWhenUserIsNotMinor() {
            // given
            Long guardianId = 1L;
            Long minorId = 13L;
            User adult = User.builder()
                    .id(minorId)
                    .email("adult@test.com")
                    .nickname("adult")
                    .birthDate(LocalDate.now().minusYears(20)) // 20세 성인
                    .build();

            given(guardianRepository.existsByGuardianIdAndMinorIdAndStatusNot(
                    guardianId, minorId, GuardianStatus.REVOKED)).willReturn(false);
            given(entityManager.find(User.class, minorId)).willReturn(adult);

            // when & then
            assertThatThrownBy(() ->
                    guardianService.requestGuardian(guardianId, minorId, ConsentMethod.PASS_AUTH))
                    .isInstanceOf(IllegalStateException.class);

            verify(guardianRepository, never()).save(any());
        }
    }
}
