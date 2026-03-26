package com.pochak.content.community.dto;

import com.pochak.content.community.entity.ModerationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ResolveReportRequest {

    @NotNull
    private ModerationStatus resolution;

    private String note;
}
