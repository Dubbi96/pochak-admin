package com.pochak.operation.schedule.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.operation.schedule.dto.CreateRecordingScheduleRequest;
import com.pochak.operation.schedule.dto.RecordingScheduleResponse;
import com.pochak.operation.schedule.dto.UpdateRecordingScheduleRequest;
import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.entity.RecordingScheduleStatus;
import com.pochak.operation.schedule.repository.RecordingScheduleRepository;
import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import com.pochak.operation.venue.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RecordingScheduleServiceTest {

    @InjectMocks
    private RecordingScheduleService recordingScheduleService;

    @Mock
    private RecordingScheduleRepository recordingScheduleRepository;

    @Mock
    private VenueRepository venueRepository;

    private Venue testVenue;
    private RecordingSchedule testSchedule;

    @BeforeEach
    void setUp() {
        testVenue = Venue.builder()
                .id(1L)
                .sportId(10L)
                .name("Test Stadium")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .isActive(true)
                .build();

        testSchedule = RecordingSchedule.builder()
                .id(100L)
                .userId(50L)
                .venueId(1L)
                .title("Test Recording")
                .startTime(LocalDateTime.of(2026, 4, 10, 14, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 16, 0))
                .memo("Test memo")
                .status(RecordingScheduleStatus.SCHEDULED)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should create a recording schedule successfully")
    void testCreateSchedule() {
        // given
        CreateRecordingScheduleRequest request = CreateRecordingScheduleRequest.builder()
                .title("New Recording")
                .venueId(1L)
                .startTime(LocalDateTime.of(2026, 4, 10, 14, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 16, 0))
                .memo("Recording memo")
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(testVenue));
        given(recordingScheduleRepository.findConflicting(eq(1L), any(), any()))
                .willReturn(Collections.emptyList());
        given(recordingScheduleRepository.save(any(RecordingSchedule.class))).willReturn(testSchedule);

        // when
        RecordingScheduleResponse result = recordingScheduleService.createSchedule(50L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getVenueId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(50L);
        assertThat(result.getTitle()).isEqualTo("Test Recording");
        assertThat(result.getStatus()).isEqualTo(RecordingScheduleStatus.SCHEDULED);
    }

    @Test
    @DisplayName("Should reject schedule when venue not found")
    void testCreateSchedule_venueNotFound() {
        // given
        CreateRecordingScheduleRequest request = CreateRecordingScheduleRequest.builder()
                .title("New Recording")
                .venueId(999L)
                .startTime(LocalDateTime.of(2026, 4, 10, 14, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 16, 0))
                .build();

        given(venueRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recordingScheduleService.createSchedule(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Venue not found");
    }

    @Test
    @DisplayName("Should reject schedule when end time is before start time")
    void testCreateSchedule_invalidTimeRange() {
        // given
        CreateRecordingScheduleRequest request = CreateRecordingScheduleRequest.builder()
                .title("Invalid Recording")
                .venueId(1L)
                .startTime(LocalDateTime.of(2026, 4, 10, 16, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 14, 0))
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(testVenue));

        // when & then
        assertThatThrownBy(() -> recordingScheduleService.createSchedule(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("End time must be after start time");
    }

    @Test
    @DisplayName("Should reject schedule with conflicting time slot")
    void testCreateSchedule_conflicting() {
        // given
        CreateRecordingScheduleRequest request = CreateRecordingScheduleRequest.builder()
                .title("Conflicting Recording")
                .venueId(1L)
                .startTime(LocalDateTime.of(2026, 4, 10, 15, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 17, 0))
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(testVenue));
        given(recordingScheduleRepository.findConflicting(eq(1L), any(), any()))
                .willReturn(List.of(testSchedule));

        // when & then
        assertThatThrownBy(() -> recordingScheduleService.createSchedule(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("conflicts");
    }

    @Test
    @DisplayName("Should get schedule by id")
    void testGetSchedule() {
        // given
        given(recordingScheduleRepository.findByIdAndIsActiveTrue(100L))
                .willReturn(Optional.of(testSchedule));

        // when
        RecordingScheduleResponse result = recordingScheduleService.getSchedule(100L);

        // then
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getTitle()).isEqualTo("Test Recording");
    }

    @Test
    @DisplayName("Should throw when schedule not found")
    void testGetSchedule_notFound() {
        // given
        given(recordingScheduleRepository.findByIdAndIsActiveTrue(999L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recordingScheduleService.getSchedule(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Recording schedule not found");
    }

    @Test
    @DisplayName("Should update schedule successfully")
    void testUpdateSchedule() {
        // given
        UpdateRecordingScheduleRequest request = UpdateRecordingScheduleRequest.builder()
                .title("Updated Title")
                .startTime(LocalDateTime.of(2026, 4, 10, 15, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 17, 0))
                .memo("Updated memo")
                .build();

        given(recordingScheduleRepository.findByIdAndIsActiveTrue(100L))
                .willReturn(Optional.of(testSchedule));
        given(recordingScheduleRepository.findConflictingExcluding(eq(1L), any(), any(), eq(100L)))
                .willReturn(Collections.emptyList());

        // when
        RecordingScheduleResponse result = recordingScheduleService.updateSchedule(100L, request);

        // then
        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getMemo()).isEqualTo("Updated memo");
    }

    @Test
    @DisplayName("Should soft delete schedule")
    void testDeleteSchedule() {
        // given
        given(recordingScheduleRepository.findByIdAndIsActiveTrue(100L))
                .willReturn(Optional.of(testSchedule));

        // when
        recordingScheduleService.deleteSchedule(100L);

        // then
        assertThat(testSchedule.getIsActive()).isFalse();
        assertThat(testSchedule.getStatus()).isEqualTo(RecordingScheduleStatus.CANCELLED);
    }
}
