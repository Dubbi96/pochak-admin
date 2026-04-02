package com.pochak.content.livestream.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ViewerCountService {

    private static final String VIEWER_KEY_PREFIX = "live:viewers:";
    private static final String PEAK_KEY_PREFIX = "live:peak:";
    private static final long VIEWER_KEY_TTL_HOURS = 24;

    private final StringRedisTemplate redisTemplate;

    public int join(Long streamId, Long userId) {
        String viewerKey = viewerKey(streamId);
        redisTemplate.opsForSet().add(viewerKey, userId.toString());
        redisTemplate.expire(viewerKey, VIEWER_KEY_TTL_HOURS, TimeUnit.HOURS);

        int current = getCurrentViewerCount(streamId);
        updatePeakIfNeeded(streamId, current);
        return current;
    }

    public int leave(Long streamId, Long userId) {
        String viewerKey = viewerKey(streamId);
        redisTemplate.opsForSet().remove(viewerKey, userId.toString());
        return getCurrentViewerCount(streamId);
    }

    public int getCurrentViewerCount(Long streamId) {
        Long size = redisTemplate.opsForSet().size(viewerKey(streamId));
        return size != null ? size.intValue() : 0;
    }

    public int getPeakViewerCount(Long streamId) {
        String val = redisTemplate.opsForValue().get(peakKey(streamId));
        return val != null ? Integer.parseInt(val) : 0;
    }

    public void resetViewers(Long streamId) {
        redisTemplate.delete(viewerKey(streamId));
        redisTemplate.delete(peakKey(streamId));
    }

    private void updatePeakIfNeeded(Long streamId, int currentCount) {
        String peakKey = peakKey(streamId);
        String peakVal = redisTemplate.opsForValue().get(peakKey);
        int peak = peakVal != null ? Integer.parseInt(peakVal) : 0;
        if (currentCount > peak) {
            redisTemplate.opsForValue().set(peakKey, String.valueOf(currentCount),
                    VIEWER_KEY_TTL_HOURS, TimeUnit.HOURS);
        }
    }

    private String viewerKey(Long streamId) {
        return VIEWER_KEY_PREFIX + streamId;
    }

    private String peakKey(Long streamId) {
        return PEAK_KEY_PREFIX + streamId;
    }
}
