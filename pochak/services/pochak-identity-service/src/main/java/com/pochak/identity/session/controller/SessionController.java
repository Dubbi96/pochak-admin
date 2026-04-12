package com.pochak.identity.session.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.identity.session.dto.SessionResponse;
import com.pochak.identity.session.entity.UserSession;
import com.pochak.identity.session.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/me/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final UserSessionRepository sessionRepository;

    @GetMapping
    public ApiResponse<List<SessionResponse>> getMySessions(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        List<SessionResponse> sessions = sessionRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(SessionResponse::from)
                .toList();
        return ApiResponse.success(sessions);
    }

    @DeleteMapping("/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeSession(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long sessionId) {
        UserSession session = sessionRepository.findById(sessionId)
                .filter(s -> s.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.deactivate();
        sessionRepository.save(session);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeAllSessions(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        sessionRepository.deactivateAllByUserId(userId);
    }
}
