package com.pochak.identity.user.dto;

import com.pochak.identity.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String phone;
    private String name;
    private LocalDate birthday;
    private String gender;
    private String nationality;
    private String profileImage;
    private String status;
    private Boolean isMarketing;
    private LocalDateTime createdAt;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getNickname())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .name(user.getName())
                .birthday(user.getBirthDate())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .nationality(user.getNationality())
                .profileImage(user.getProfileImageUrl())
                .status(user.getStatus().name())
                .isMarketing(user.getIsMarketing())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
