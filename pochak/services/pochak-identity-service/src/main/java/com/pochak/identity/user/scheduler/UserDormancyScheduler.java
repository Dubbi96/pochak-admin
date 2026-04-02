package com.pochak.identity.user.scheduler;

import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDormancyScheduler {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 4 * * *") // 매일 04:00
    @Transactional
    public void checkDormantUsers() {
        // 1. Find ACTIVE users where lastLoginAt < 90 days ago → set DORMANT_PENDING
        // 2. Find DORMANT_PENDING users where status changed > 180 days ago → set DORMANT
        log.info("[Dormancy] Starting daily dormancy check...");
        // Stub: log intent, actual queries need repository methods
        log.info("[Dormancy] Completed.");
    }
}
