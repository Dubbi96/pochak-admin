package com.pochak.content.club.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApproveMemberRequest {

    private Long managerId;
    private String rejectionReason;
}
