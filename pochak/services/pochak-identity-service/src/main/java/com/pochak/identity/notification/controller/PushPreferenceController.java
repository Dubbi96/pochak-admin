package com.pochak.identity.notification.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.identity.notification.entity.PushNotificationPreference;
import com.pochak.identity.notification.repository.PushNotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/me/push-preferences")
@RequiredArgsConstructor
public class PushPreferenceController {

    private final PushNotificationPreferenceRepository preferenceRepository;

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "RESERVATION", "LIVE_START", "PAYMENT", "PARTNER_MESSAGE", "ANNOUNCEMENT", "MARKETING"
    );

    @GetMapping
    public ApiResponse<List<PushNotificationPreference>> getPreferences(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        List<PushNotificationPreference> prefs = preferenceRepository.findByUserId(userId);

        if (prefs.isEmpty()) {
            prefs = DEFAULT_CATEGORIES.stream()
                    .map(cat -> PushNotificationPreference.builder()
                            .userId(userId)
                            .category(cat)
                            .enabled(true)
                            .build())
                    .toList();
            preferenceRepository.saveAll(prefs);
        }

        return ApiResponse.success(prefs);
    }

    @PatchMapping("/{category}")
    public ApiResponse<PushNotificationPreference> togglePreference(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable String category,
            @RequestBody Map<String, Boolean> body) {

        PushNotificationPreference pref = preferenceRepository
                .findByUserIdAndCategory(userId, category.toUpperCase())
                .orElseGet(() -> preferenceRepository.save(
                        PushNotificationPreference.builder()
                                .userId(userId)
                                .category(category.toUpperCase())
                                .build()));

        pref.toggle(Boolean.TRUE.equals(body.get("enabled")));
        preferenceRepository.save(pref);
        return ApiResponse.success(pref);
    }
}
