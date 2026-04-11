package com.pochak.operation.recording.service;

import com.pochak.common.event.EventPublisher;
import com.pochak.common.exception.BusinessException;
import com.pochak.operation.event.RecordingCompletedEvent;
import com.pochak.operation.recording.dto.RecordingSessionResponse;
import com.pochak.operation.recording.dto.StartRecordingSessionRequest;
import com.pochak.operation.recording.entity.RecordingSession;
import com.pochak.operation.recording.entity.RecordingSessionStatus;
import com.pochak.operation.recording.repository.RecordingSessionRepository;
import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.entity.RecordingScheduleStatus;
import com.pochak.operation.schedule.repository.RecordingScheduleRepository;
import com.pochak.operation.vpu.VpuService;
import com.pochak.operation.vpu.dto.RecordingConfig;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RecordingSessionServiceTest {

    @InjectMocks
    private RecordingSessionService recordingSessionService;

    @Mock
    private RecordingSessionRepository recordingSessionRepository;

    @Mock
    private RecordingScheduleRepository recordingScheduleRepository;

    @Mock
    private VpuService vpuService;

    @Mock
    private EventPublisher eventPublisher;

    private RecordingSchedule testSchedule;
    private RecordingSession testSession;

    @BeforeEach
    void setUp() {
        testSchedule = RecordingSchedule.builder()
                .id(1L)
                .userId(50L)
                .venueId(10L)
                .title("Test Schedule")
                .startTime(LocalDateTime.of(2026, 4, 10, 14, 0))
                .endTime(LocalDateTime.of(2026, 4, 10, 16, 0))
                .status(RecordingScheduleStatus.SCHEDULED)
                .isActive(true)
                .build();

        testSession = RecordingSession.builder()
                .id(100L)
                .scheduleId(1L)
                .cameraId(5L)
                .userId(50L)
                .venueId(10L)
                .status(RecordingSessionStatus.RECORDING)
                .startedAt(LocalDateTime.of(2026, 4, 10, 14, 0))
                .build();
    }

    @Test
    @DisplayName("Should start a recording session successfully")
    void testStartSession() {
        // given
        StartRecordingSessionRequest request = StartRecordingSessionRequest.builder()
                .scheduleId(1L)
                .cameraId(5L)
                .build();

        given(recordingScheduleRepository.findByIdAndIsActiveTrue(1L))
                .willReturn(Optional.of(testSchedule));
        given(recordingSessionRepository.findByScheduleIdAndStatusIn(eq(1L), any()))
                .willReturn(Collections.emptyList());
        given(recordingSessionRepository.save(any(RecordingSession.class)))
                .willReturn(testSession);

        // when
        RecordingSessionResponse result = recordingSessionService.startSession(50L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getScheduleId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo(RecordingSessionStatus.RECORDING);
        verify(vpuService).startRecording(eq(100L), any(RecordingConfig.class));
    }

    @Test
    @DisplayName("Should start session without VPU when no cameraId")
    void testStartSession_noCamera() {
        // given
        StartRecordingSessionRequest request = StartRecordingSessionRequest.builder()
                .scheduleId(1L)
                .cameraId(null)
                .build();

        RecordingSession noCameraSession = RecordingSession.builder()
                .id(101L)
                .scheduleId(1L)
                .cameraId(null)
                .userId(50L)
                .venueId(10L)
                .status(RecordingSessionStatus.RECORDING)
                .build();

        given(recordingScheduleRepository.findByIdAndIsActiveTrue(1L))
                .willReturn(Optional.of(testSchedule));
        given(recordingSessionRepository.findByScheduleIdAndStatusIn(eq(1L), any()))
                .willReturn(Collections.emptyList());
        given(recordingSessionRepository.save(any(RecordingSession.class)))
                .willReturn(noCameraSession);

        // when
        RecordingSessionResponse result = recordingSessionService.startSession(50L, request);

        // then
        assertThat(result).isNotNull();
        verify(vpuService, never()).startRecording(any(), any());
    }

    @Test
    @DisplayName("Should reject starting when schedule not found")
    void testStartSession_scheduleNotFound() {
        // given
        StartRecordingSessionRequest request = StartRecordingSessionRequest.builder()
                .scheduleId(999L)
                .build();

        given(recordingScheduleRepository.findByIdAndIsActiveTrue(999L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recordingSessionService.startSession(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Recording schedule not found");
    }

    @Test
    @DisplayName("Should reject starting when active session already exists")
    void testStartSession_duplicateActive() {
        // given
        StartRecordingSessionRequest request = StartRecordingSessionRequest.builder()
                .scheduleId(1L)
                .build();

        given(recordingScheduleRepository.findByIdAndIsActiveTrue(1L))
                .willReturn(Optional.of(testSchedule));
        given(recordingSessionRepository.findByScheduleIdAndStatusIn(eq(1L), any()))
                .willReturn(List.of(testSession));

        // when & then
        assertThatThrownBy(() -> recordingSessionService.startSession(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("active recording session already exists");
    }

    @Test
    @DisplayName("Should stop a recording session")
    void testStopSession() {
        // given
        given(recordingSessionRepository.findById(100L))
                .willReturn(Optional.of(testSession));

        // when
        RecordingSessionResponse result = recordingSessionService.stopSession(100L);

        // then
        assertThat(result.getStatus()).isEqualTo(RecordingSessionStatus.PAUSED);
        verify(vpuService).stopRecording(100L);
    }

    @Test
    @DisplayName("Should reject stopping a non-recording session")
    void testStopSession_invalidStatus() {
        // given
        RecordingSession completedSession = RecordingSession.builder()
                .id(200L)
                .scheduleId(1L)
                .userId(50L)
                .venueId(10L)
                .status(RecordingSessionStatus.COMPLETED)
                .build();

        given(recordingSessionRepository.findById(200L))
                .willReturn(Optional.of(completedSession));

        // when & then
        assertThatThrownBy(() -> recordingSessionService.stopSession(200L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not currently recording");
    }

    @Test
    @DisplayName("Should complete a paused session and publish event")
    void testCompleteSession_fromPaused() {
        // given
        RecordingSession pausedSession = RecordingSession.builder()
                .id(100L)
                .scheduleId(1L)
                .cameraId(5L)
                .userId(50L)
                .venueId(10L)
                .status(RecordingSessionStatus.PAUSED)
                .build();

        given(recordingSessionRepository.findById(100L))
                .willReturn(Optional.of(pausedSession));

        // when
        RecordingSessionResponse result = recordingSessionService.completeSession(100L);

        // then
        assertThat(result.getStatus()).isEqualTo(RecordingSessionStatus.COMPLETED);
        verify(eventPublisher).publish(any(RecordingCompletedEvent.class));
        verify(vpuService, never()).stopRecording(any());
    }

    @Test
    @DisplayName("Should complete a recording session, stop VPU, and publish event")
    void testCompleteSession_fromRecording() {
        // given
        given(recordingSessionRepository.findById(100L))
                .willReturn(Optional.of(testSession));

        // when
        RecordingSessionResponse result = recordingSessionService.completeSession(100L);

        // then
        assertThat(result.getStatus()).isEqualTo(RecordingSessionStatus.COMPLETED);
        verify(vpuService).stopRecording(100L);
        verify(eventPublisher).publish(any(RecordingCompletedEvent.class));
    }

    @Test
    @DisplayName("Should get session status")
    void testGetSessionStatus() {
        // given
        given(recordingSessionRepository.findById(100L))
                .willReturn(Optional.of(testSession));

        // when
        RecordingSessionResponse result = recordingSessionService.getSessionStatus(100L);

        // then
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo(RecordingSessionStatus.RECORDING);
    }

    @Test
    @DisplayName("Should throw when session not found")
    void testGetSessionStatus_notFound() {
        // given
        given(recordingSessionRepository.findById(999L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recordingSessionService.getSessionStatus(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Recording session not found");
    }
}
