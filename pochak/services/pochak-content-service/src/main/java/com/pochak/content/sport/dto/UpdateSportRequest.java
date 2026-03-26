package com.pochak.content.sport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSportRequest {

    @NotBlank(message = "Sport name is required")
    private String name;

    private String nameEn;

    @NotBlank(message = "Sport code is required")
    private String code;

    private String description;

    private String imageUrl;

    private String iconUrl;

    private Integer displayOrder;
}
