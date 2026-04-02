package com.pochak.identity.user.scheduler;

import com.pochak.identity.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;

@ExtendWith(MockitoExtension.class)
class UserDormancySchedulerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDormancyScheduler scheduler;

    @Test
    @DisplayName("checkDormantUsers should execute without errors")
    void checkDormantUsers_shouldExecuteWithoutErrors() {
        // The current implementation is a stub that only logs.
        // Verify it runs without throwing any exception.
        assertThatCode(() -> scheduler.checkDormantUsers()).doesNotThrowAnyException();
    }
}
