package com.pochak.content.livestream.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ViewerCountServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private SetOperations<String, String> setOperations;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private ViewerCountService viewerCountService;

    private static final Long STREAM_ID = 1L;
    private static final Long USER_ID = 100L;
    private static final String VIEWER_KEY = "live:viewers:1";
    private static final String PEAK_KEY = "live:peak:1";

    @BeforeEach
    void setUp() {
        viewerCountService = new ViewerCountService(redisTemplate);
    }

    @Test
    @DisplayName("시청자 참여 시 Redis Set에 추가하고 현재 수를 반환한다")
    void join() {
        // given
        given(redisTemplate.opsForSet()).willReturn(setOperations);
        given(setOperations.add(VIEWER_KEY, "100")).willReturn(1L);
        given(setOperations.size(VIEWER_KEY)).willReturn(5L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get(PEAK_KEY)).willReturn("3");

        // when
        int count = viewerCountService.join(STREAM_ID, USER_ID);

        // then
        assertThat(count).isEqualTo(5);
        verify(setOperations).add(VIEWER_KEY, "100");
        verify(redisTemplate).expire(VIEWER_KEY, 24, TimeUnit.HOURS);
    }

    @Test
    @DisplayName("시청자 퇴장 시 Redis Set에서 제거하고 현재 수를 반환한다")
    void leave() {
        // given
        given(redisTemplate.opsForSet()).willReturn(setOperations);
        given(setOperations.remove(VIEWER_KEY, "100")).willReturn(1L);
        given(setOperations.size(VIEWER_KEY)).willReturn(4L);

        // when
        int count = viewerCountService.leave(STREAM_ID, USER_ID);

        // then
        assertThat(count).isEqualTo(4);
        verify(setOperations).remove(VIEWER_KEY, "100");
    }

    @Test
    @DisplayName("현재 시청자 수를 조회한다")
    void getCurrentViewerCount() {
        // given
        given(redisTemplate.opsForSet()).willReturn(setOperations);
        given(setOperations.size(VIEWER_KEY)).willReturn(10L);

        // when
        int count = viewerCountService.getCurrentViewerCount(STREAM_ID);

        // then
        assertThat(count).isEqualTo(10);
    }

    @Test
    @DisplayName("시청자 키가 없으면 0을 반환한다")
    void getCurrentViewerCountWhenKeyMissing() {
        // given
        given(redisTemplate.opsForSet()).willReturn(setOperations);
        given(setOperations.size(VIEWER_KEY)).willReturn(null);

        // when
        int count = viewerCountService.getCurrentViewerCount(STREAM_ID);

        // then
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("피크 시청자 수를 조회한다")
    void getPeakViewerCount() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get(PEAK_KEY)).willReturn("150");

        // when
        int peak = viewerCountService.getPeakViewerCount(STREAM_ID);

        // then
        assertThat(peak).isEqualTo(150);
    }

    @Test
    @DisplayName("참여 시 피크 수가 갱신된다")
    void joinUpdatesPeak() {
        // given
        given(redisTemplate.opsForSet()).willReturn(setOperations);
        given(setOperations.add(VIEWER_KEY, "100")).willReturn(1L);
        given(setOperations.size(VIEWER_KEY)).willReturn(10L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get(PEAK_KEY)).willReturn("8");

        // when
        viewerCountService.join(STREAM_ID, USER_ID);

        // then
        verify(valueOperations).set(eq(PEAK_KEY), eq("10"), eq(24L), eq(TimeUnit.HOURS));
    }

    @Test
    @DisplayName("시청자 데이터를 초기화한다")
    void resetViewers() {
        // given & when
        viewerCountService.resetViewers(STREAM_ID);

        // then
        verify(redisTemplate).delete(VIEWER_KEY);
        verify(redisTemplate).delete(PEAK_KEY);
    }
}
