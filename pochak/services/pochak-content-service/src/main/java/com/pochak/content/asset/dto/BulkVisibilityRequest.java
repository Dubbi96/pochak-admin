package com.pochak.content.asset.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkVisibilityRequest {

    @NotEmpty(message = "IDs must not be empty")
    private List<Long> ids;

    @NotNull(message = "isDisplayed must not be null")
    private Boolean isDisplayed;
}
