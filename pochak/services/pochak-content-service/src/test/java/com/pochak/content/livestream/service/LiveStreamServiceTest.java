package com.pochak.content.livestream.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.livestream.dto.CreateLiveStreamRequest;
import com.pochak.content.livestream.dto.LiveStreamResponse;
import com.pochak.content.livestream.dto.StartLiveStreamRequest;
import com.pochak.content.livestream.dto.ViewerCountResponse;
import com.pochak.content.livestream.entity.LiveStream;
import com.pochak.content.livestream.entity.LiveStream.StreamStatus;
import com.pochak.content.livestream.entity.LiveStream.StreamVisibility;
import com.pochak.content.livestream.repository.LiveStreamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class LiveStreamServiceTest {

    @Mock
    private LiveStreamRepository liveStreamRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private ViewerCountService viewerCountService;

    @InjectMocks
    private LiveStreamService liveStreamService;

    private Match testMatch;
    private static final Long STREAMER_USER_ID = 100L;
    private static final Long OTHER_USER_ID = 200L;

    @BeforeEach
    void setUp() {
        Competition competition = Competition.builder()
                .id(1L)
                .name("Test League")
                .build();

        testMatch = Match.builder()
                .id(1L)
                .competition(competition)
                .title("Team A vs Team B")
                .startTime(LocalDateTime.of(2026, 4, 1, 15, 0))
                .build();
    }

    @Nested
    @DisplayName("방송 생성")
    class CreateTests {

        @Test
        @DisplayName("매치 연결 없이 방송을 생성한다")
        void createWithoutMatch() {
            // given
            CreateLiveStreamRequest request = CreateLiveStreamRequest.builder()
                    .title("테스트 방송")
                    .description("테스트 설명")
                    .visibility(StreamVisibility.PUBLIC)
                    .scheduledAt(LocalDateTime.of(2026, 4, 2, 20, 0))
                    .build();

            given(liveStreamRepository.save(any(LiveStream.class)))
                    .willAnswer(invocation -> {
                        LiveStream stream = invocation.getArgument(0);
                        return LiveStream.builder()
                                .id(1L)
                                .title(stream.getTitle())
                                .description(stream.getDescription())
                                .streamerUserId(STREAMER_USER_ID)
                                .streamKey(stream.getStreamKey())
                                .status(StreamStatus.SCHEDULED)
                                .visibility(stream.getVisibility())
                                .scheduledAt(stream.getScheduledAt())
                                .peakViewerCount(0)
                                .totalViewCount(0L)
                                .build();
                    });

            // when
            LiveStreamResponse result = liveStreamService.create(STREAMER_USER_ID, request);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("테스트 방송");
            assertThat(result.getStatus()).isEqualTo(StreamStatus.SCHEDULED);
            assertThat(result.getVisibility()).isEqualTo(StreamVisibility.PUBLIC);
            assertThat(result.getStreamKey()).isNotNull();
            verify(liveStreamRepository).save(any(LiveStream.class));
        }

        @Test
        @DisplayName("매치와 연결하여 방송을 생성한다")
        void createWithMatch() {
            // given
            CreateLiveStreamRequest request = CreateLiveStreamRequest.builder()
                    .title("경기 중계")
                    .matchId(1L)
                    .build();

            given(matchRepository.findById(1L)).willReturn(Optional.of(testMatch));
            given(liveStreamRepository.save(any(LiveStream.class)))
                    .willAnswer(invocation -> {
                        LiveStream stream = invocation.getArgument(0);
                        return LiveStream.builder()
                                .id(2L)
                                .title(stream.getTitle())
                                .streamerUserId(STREAMER_USER_ID)
                                .match(testMatch)
                                .streamKey(stream.getStreamKey())
                                .status(StreamStatus.SCHEDULED)
                                .visibility(StreamVisibility.PUBLIC)
                                .peakViewerCount(0)
                                .totalViewCount(0L)
                                .build();
                    });

            // when
            LiveStreamResponse result = liveStreamService.create(STREAMER_USER_ID, request);

            // then
            assertThat(result.getId()).isEqualTo(2L);
            assertThat(result.getMatchId()).isEqualTo(1L);
            verify(matchRepository).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 매치를 연결하면 예외가 발생한다")
        void createWithInvalidMatch() {
            // given
            CreateLiveStreamRequest request = CreateLiveStreamRequest.builder()
                    .title("잘못된 매치")
                    .matchId(999L)
                    .build();

            given(matchRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> liveStreamService.create(STREAMER_USER_ID, request))
                    .isInstanceOf(BusinessException.class);
        }
    }

    @Nested
    @DisplayName("방송 시작")
    class StartTests {

        @Test
        @DisplayName("예약된 방송을 시작한다")
        void startScheduledStream() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));

            StartLiveStreamRequest request = new StartLiveStreamRequest("rtmp://custom.url/live");

            // when
            LiveStreamResponse result = liveStreamService.start(1L, STREAMER_USER_ID, request);

            // then
            assertThat(result.getStatus()).isEqualTo(StreamStatus.LIVE);
            assertThat(result.getStreamUrl()).isEqualTo("rtmp://custom.url/live");
        }

        @Test
        @DisplayName("다른 유저가 방송을 시작하면 예외가 발생한다")
        void startByNonOwner() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));

            // when & then
            assertThatThrownBy(() -> liveStreamService.start(1L, OTHER_USER_ID, null))
                    .isInstanceOf(BusinessException.class);
        }
    }

    @Nested
    @DisplayName("방송 종료")
    class StopTests {

        @Test
        @DisplayName("라이브 방송을 종료한다")
        void stopLiveStream() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();
            // start the stream first
            stream.start("rtmp://test.url/live");

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));
            given(viewerCountService.getPeakViewerCount(1L)).willReturn(150);
            given(viewerCountService.getCurrentViewerCount(1L)).willReturn(42);

            // when
            LiveStreamResponse result = liveStreamService.stop(1L, STREAMER_USER_ID);

            // then
            assertThat(result.getStatus()).isEqualTo(StreamStatus.ENDED);
            assertThat(result.getPeakViewerCount()).isEqualTo(150);
            verify(viewerCountService).resetViewers(1L);
        }

        @Test
        @DisplayName("SCHEDULED 상태에서 종료하면 예외가 발생한다")
        void stopScheduledStream() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));

            // when & then
            assertThatThrownBy(() -> liveStreamService.stop(1L, STREAMER_USER_ID))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("시청자 수 관리")
    class ViewerTests {

        @Test
        @DisplayName("라이브 방송에 시청자가 참여한다")
        void joinLiveStream() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();
            stream.start("rtmp://test.url/live");

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));
            given(viewerCountService.join(1L, 300L)).willReturn(5);
            given(viewerCountService.getPeakViewerCount(1L)).willReturn(5);

            // when
            ViewerCountResponse result = liveStreamService.joinStream(1L, 300L);

            // then
            assertThat(result.getStreamId()).isEqualTo(1L);
            assertThat(result.getCurrentViewerCount()).isEqualTo(5);
        }

        @Test
        @DisplayName("SCHEDULED 방송에 참여하면 예외가 발생한다")
        void joinScheduledStream() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));

            // when & then
            assertThatThrownBy(() -> liveStreamService.joinStream(1L, 300L))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("시청자가 방송을 떠난다")
        void leaveStream() {
            // given
            given(viewerCountService.leave(1L, 300L)).willReturn(4);
            given(viewerCountService.getPeakViewerCount(1L)).willReturn(5);

            // when
            ViewerCountResponse result = liveStreamService.leaveStream(1L, 300L);

            // then
            assertThat(result.getCurrentViewerCount()).isEqualTo(4);
            assertThat(result.getPeakViewerCount()).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("방송 조회")
    class QueryTests {

        @Test
        @DisplayName("방송 상세 정보를 조회한다")
        void getById() {
            // given
            LiveStream stream = LiveStream.builder()
                    .id(1L)
                    .title("테스트 방송")
                    .streamerUserId(STREAMER_USER_ID)
                    .streamKey("pck-live-test123")
                    .status(StreamStatus.SCHEDULED)
                    .visibility(StreamVisibility.PUBLIC)
                    .peakViewerCount(0)
                    .totalViewCount(0L)
                    .build();
            stream.start("rtmp://test.url/live");

            given(liveStreamRepository.findByIdAndDeletedAtIsNull(1L))
                    .willReturn(Optional.of(stream));
            given(viewerCountService.getCurrentViewerCount(1L)).willReturn(25);

            // when
            LiveStreamResponse result = liveStreamService.getById(1L);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getCurrentViewerCount()).isEqualTo(25);
        }

        @Test
        @DisplayName("존재하지 않는 방송을 조회하면 예외가 발생한다")
        void getByIdNotFound() {
            // given
            given(liveStreamRepository.findByIdAndDeletedAtIsNull(999L))
                    .willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> liveStreamService.getById(999L))
                    .isInstanceOf(BusinessException.class);
        }
    }
}
