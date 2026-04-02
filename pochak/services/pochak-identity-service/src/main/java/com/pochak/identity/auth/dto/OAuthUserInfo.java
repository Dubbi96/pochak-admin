package com.pochak.identity.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthUserInfo {

    private String providerId;
    private String email;
    private String name;
    private String profileImageUrl;
    private String provider;
}
