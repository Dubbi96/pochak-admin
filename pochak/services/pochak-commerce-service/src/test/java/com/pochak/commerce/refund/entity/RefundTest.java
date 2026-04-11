package com.pochak.commerce.refund.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RefundTest {

    private Refund createRefund(RefundStatus status) {
        Refund refund = Refund.builder()
                .id(1L)
                .purchaseId(10L)
                .userId(50L)
                .refundAmount(new BigDecimal("9900"))
                .reason("단순 변심")
                .build();

        // 빌더 기본값은 REQUESTED이므로 원하는 상태까지 전이
        switch (status) {
            case APPROVED -> refund.approve("승인 처리");
            case REJECTED -> refund.reject("환불 불가 기간");
            case COMPLETED -> {
                refund.approve("승인 처리");
                refund.complete();
            }
            default -> {
                // REQUESTED
            }
        }
        return refund;
    }

    @Nested
    @DisplayName("approve() 테스트")
    class ApproveTest {

        @Test
        @DisplayName("REQUESTED 상태에서 승인이 정상 동작한다")
        void approve_fromRequested_succeeds() {
            Refund refund = createRefund(RefundStatus.REQUESTED);

            refund.approve("관리자 승인");

            assertThat(refund.getStatus()).isEqualTo(RefundStatus.APPROVED);
            assertThat(refund.getAdminNote()).isEqualTo("관리자 승인");
            assertThat(refund.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("APPROVED 상태에서 승인 시 예외가 발생한다")
        void approve_fromApproved_throws() {
            Refund refund = createRefund(RefundStatus.APPROVED);

            assertThatThrownBy(() -> refund.approve("다시 승인"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only REQUESTED");
        }

        @Test
        @DisplayName("REJECTED 상태에서 승인 시 예외가 발생한다")
        void approve_fromRejected_throws() {
            Refund refund = createRefund(RefundStatus.REJECTED);

            assertThatThrownBy(() -> refund.approve("승인 변경"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only REQUESTED");
        }

        @Test
        @DisplayName("COMPLETED 상태에서 승인 시 예외가 발생한다")
        void approve_fromCompleted_throws() {
            Refund refund = createRefund(RefundStatus.COMPLETED);

            assertThatThrownBy(() -> refund.approve("재승인"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only REQUESTED");
        }
    }

    @Nested
    @DisplayName("reject() 테스트")
    class RejectTest {

        @Test
        @DisplayName("REQUESTED 상태에서 거절이 정상 동작한다")
        void reject_fromRequested_succeeds() {
            Refund refund = createRefund(RefundStatus.REQUESTED);

            refund.reject("환불 기간 초과");

            assertThat(refund.getStatus()).isEqualTo(RefundStatus.REJECTED);
            assertThat(refund.getAdminNote()).isEqualTo("환불 기간 초과");
            assertThat(refund.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("APPROVED 상태에서 거절 시 예외가 발생한다")
        void reject_fromApproved_throws() {
            Refund refund = createRefund(RefundStatus.APPROVED);

            assertThatThrownBy(() -> refund.reject("거절 변경"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only REQUESTED");
        }

        @Test
        @DisplayName("REJECTED 상태에서 거절 시 예외가 발생한다")
        void reject_fromRejected_throws() {
            Refund refund = createRefund(RefundStatus.REJECTED);

            assertThatThrownBy(() -> refund.reject("중복 거절"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only REQUESTED");
        }
    }

    @Nested
    @DisplayName("complete() 테스트")
    class CompleteTest {

        @Test
        @DisplayName("APPROVED 상태에서 완료 처리가 정상 동작한다")
        void complete_fromApproved_succeeds() {
            Refund refund = createRefund(RefundStatus.APPROVED);

            refund.complete();

            assertThat(refund.getStatus()).isEqualTo(RefundStatus.COMPLETED);
        }

        @Test
        @DisplayName("REQUESTED 상태에서도 complete()가 호출될 수 있다 (가드 없음)")
        void complete_fromRequested_setsCompleted() {
            // complete() 메서드에는 상태 검증이 없으므로 호출 가능
            Refund refund = createRefund(RefundStatus.REQUESTED);

            refund.complete();

            assertThat(refund.getStatus()).isEqualTo(RefundStatus.COMPLETED);
        }
    }

    @Nested
    @DisplayName("기본값 및 엣지 케이스 테스트")
    class DefaultAndEdgeCaseTest {

        @Test
        @DisplayName("빌더 기본 상태가 REQUESTED이다")
        void defaultStatus_isRequested() {
            Refund refund = Refund.builder()
                    .purchaseId(10L)
                    .userId(50L)
                    .refundAmount(new BigDecimal("5000"))
                    .reason("테스트")
                    .build();

            assertThat(refund.getStatus()).isEqualTo(RefundStatus.REQUESTED);
        }

        @Test
        @DisplayName("adminNote가 null인 승인도 가능하다")
        void approve_withNullNote() {
            Refund refund = createRefund(RefundStatus.REQUESTED);

            refund.approve(null);

            assertThat(refund.getStatus()).isEqualTo(RefundStatus.APPROVED);
            assertThat(refund.getAdminNote()).isNull();
        }

        @Test
        @DisplayName("환불 금액이 정확히 보존된다")
        void refundAmount_preserved() {
            Refund refund = Refund.builder()
                    .purchaseId(10L)
                    .userId(50L)
                    .refundAmount(new BigDecimal("12345.67"))
                    .reason("정밀 테스트")
                    .build();

            assertThat(refund.getRefundAmount()).isEqualByComparingTo(new BigDecimal("12345.67"));
        }
    }
}
