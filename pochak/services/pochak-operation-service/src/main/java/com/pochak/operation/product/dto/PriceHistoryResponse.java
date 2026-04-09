package com.pochak.operation.product.dto;

import com.pochak.operation.product.entity.ProductPriceHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistoryResponse {

    private Long id;
    private Long productId;
    private Long changedBy;
    private Integer prevPricePerHour;
    private Integer newPricePerHour;
    private Integer prevPricePerDay;
    private Integer newPricePerDay;
    private String changeReason;
    private LocalDateTime createdAt;

    public static PriceHistoryResponse from(ProductPriceHistory h) {
        return PriceHistoryResponse.builder()
                .id(h.getId())
                .productId(h.getProductId())
                .changedBy(h.getChangedBy())
                .prevPricePerHour(h.getPrevPricePerHour())
                .newPricePerHour(h.getNewPricePerHour())
                .prevPricePerDay(h.getPrevPricePerDay())
                .newPricePerDay(h.getNewPricePerDay())
                .changeReason(h.getChangeReason())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
