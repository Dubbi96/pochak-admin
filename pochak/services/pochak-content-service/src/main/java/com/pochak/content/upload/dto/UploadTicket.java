package com.pochak.content.upload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadTicket {

    private Long id;
    private String uploadUrl;        // presigned URL for PUT
    private String storageKey;       // internal storage path
    private String status;           // CREATED, UPLOADING, UPLOADED, EXPIRED
    private LocalDateTime expiresAt; // presigned URL expiry
}
