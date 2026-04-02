package com.pochak.content.community.dto;

import com.pochak.content.community.entity.ReportCategory;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReportPostRequest {

    @NotNull
    private ReportCategory category;

    private String reason;
}
