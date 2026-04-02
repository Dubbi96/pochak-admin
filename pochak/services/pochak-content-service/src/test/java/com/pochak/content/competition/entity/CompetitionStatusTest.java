package com.pochak.content.competition.entity;

import com.pochak.content.sport.entity.Sport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * L5: CompetitionStatus 용어 정합 테스트.
 * 정책: SCHEDULED, ONGOING, COMPLETED, CANCELLED
 * 이전: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
 */
class CompetitionStatusTest {

    private Sport testSport = Sport.builder()
            .id(1L).name("Football").nameEn("Football").code("SOCCER")
            .active(true).displayOrder(1).tags(new ArrayList<>()).build();

    @Test
    @DisplayName("SCHEDULED -> ONGOING -> COMPLETED 상태 전이 확인")
    void statusTransition_scheduled_ongoing_completed() {
        // given: SCHEDULED 상태의 대회
        Competition competition = Competition.builder()
                .id(1L)
                .name("Test Cup")
                .sport(testSport)
                .status(Competition.CompetitionStatus.SCHEDULED)
                .active(true)
                .build();

        assertThat(competition.getStatus()).isEqualTo(Competition.CompetitionStatus.SCHEDULED);

        // ONGOING 상태의 대회 생성 (상태 전이 시뮬레이션)
        Competition ongoingCompetition = Competition.builder()
                .id(2L)
                .name("Ongoing Cup")
                .sport(testSport)
                .status(Competition.CompetitionStatus.ONGOING)
                .active(true)
                .build();

        assertThat(ongoingCompetition.getStatus()).isEqualTo(Competition.CompetitionStatus.ONGOING);

        // COMPLETED 상태
        Competition completedCompetition = Competition.builder()
                .id(3L)
                .name("Completed Cup")
                .sport(testSport)
                .status(Competition.CompetitionStatus.COMPLETED)
                .active(true)
                .build();

        assertThat(completedCompetition.getStatus()).isEqualTo(Competition.CompetitionStatus.COMPLETED);
    }

    @Test
    @DisplayName("CANCELLED 상태 확인")
    void cancelledStatus() {
        Competition competition = Competition.builder()
                .id(1L)
                .name("Cancelled Cup")
                .sport(testSport)
                .status(Competition.CompetitionStatus.CANCELLED)
                .active(true)
                .build();

        assertThat(competition.getStatus()).isEqualTo(Competition.CompetitionStatus.CANCELLED);
    }

    @Test
    @DisplayName("구 용어 IN_PROGRESS 사용 시 IllegalArgumentException")
    void legacyInProgress_throws() {
        assertThatThrownBy(() -> Competition.CompetitionStatus.valueOf("IN_PROGRESS"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("ONGOING이 정책 enum에 존재 확인")
    void ongoingExists() {
        Competition.CompetitionStatus ongoing = Competition.CompetitionStatus.valueOf("ONGOING");
        assertThat(ongoing).isEqualTo(Competition.CompetitionStatus.ONGOING);
    }

    @Test
    @DisplayName("모든 정책 CompetitionStatus 값 확인")
    void allPolicyStatuses() {
        Competition.CompetitionStatus[] values = Competition.CompetitionStatus.values();
        assertThat(values).hasSize(4);
        assertThat(values).containsExactly(
                Competition.CompetitionStatus.SCHEDULED,
                Competition.CompetitionStatus.ONGOING,
                Competition.CompetitionStatus.COMPLETED,
                Competition.CompetitionStatus.CANCELLED
        );
    }
}
