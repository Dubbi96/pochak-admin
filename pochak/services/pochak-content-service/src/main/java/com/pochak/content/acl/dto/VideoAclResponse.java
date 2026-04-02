package com.pochak.content.acl.dto;

import com.pochak.content.acl.entity.VideoAcl;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoAclResponse {

    private Long id;
    private String contentType;
    private Long contentId;
    private String defaultPolicy;
    private Map<String, Object> policy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VideoAclResponse from(VideoAcl acl) {
        return VideoAclResponse.builder()
                .id(acl.getId())
                .contentType(acl.getContentType().name())
                .contentId(acl.getContentId())
                .defaultPolicy(acl.getDefaultPolicy().name())
                .policy(acl.getPolicy())
                .createdAt(acl.getCreatedAt())
                .updatedAt(acl.getUpdatedAt())
                .build();
    }
}
