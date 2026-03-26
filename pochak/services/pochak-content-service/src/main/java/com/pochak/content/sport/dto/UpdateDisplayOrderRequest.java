package com.pochak.content.sport.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDisplayOrderRequest {

    @NotNull(message = "Orders list is required")
    private List<OrderEntry> orders;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderEntry {

        @NotNull
        private Long id;

        @NotNull
        private Integer displayOrder;
    }
}
