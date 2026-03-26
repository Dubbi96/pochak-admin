package com.pochak.content.upload.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUploadRequest {

    @NotBlank(message = "filename is required")
    @Size(max = 255, message = "filename must not exceed 255 characters")
    private String filename;

    @NotBlank(message = "contentType is required")
    @Pattern(regexp = "^video/(mp4|quicktime|x-msvideo|webm)$", message = "Unsupported content type")
    private String contentType; // "video/mp4", "video/quicktime"

    @NotNull(message = "fileSizeBytes is required")
    @Min(value = 1, message = "fileSizeBytes must be positive")
    private Long fileSizeBytes;

    private Long matchId;       // optional - link to match

    @Size(max = 200, message = "title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "description must not exceed 2000 characters")
    private String description;

    @Size(max = 20, message = "Maximum 20 tags allowed")
    private List<String> tags;

    private Long uploadedByUserId;
}
