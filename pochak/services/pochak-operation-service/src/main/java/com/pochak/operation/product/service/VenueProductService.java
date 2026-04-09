package com.pochak.operation.product.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.product.dto.*;
import com.pochak.operation.product.entity.ProductPriceHistory;
import com.pochak.operation.product.entity.VenueProduct;
import com.pochak.operation.product.entity.VenueTimeSlot;
import com.pochak.operation.product.repository.ProductPriceHistoryRepository;
import com.pochak.operation.product.repository.VenueProductRepository;
import com.pochak.operation.product.repository.VenueTimeSlotRepository;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VenueProductService {

    private final VenueProductRepository venueProductRepository;
    private final VenueTimeSlotRepository venueTimeSlotRepository;
    private final VenueRepository venueRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;

    @Transactional
    public VenueProductResponse createProduct(Long userId, Long venueId, CreateVenueProductRequest request) {
        validateVenueOwnership(userId, venueId);

        VenueProduct product = VenueProduct.builder()
                .venueId(venueId)
                .name(request.getName())
                .description(request.getDescription())
                .productType(request.getProductType())
                .pricePerHour(request.getPricePerHour())
                .pricePerDay(request.getPricePerDay())
                .maxCapacity(request.getMaxCapacity())
                .includedCameras(request.getIncludedCameras() != null ? request.getIncludedCameras() : 0)
                .build();

        VenueProduct saved = venueProductRepository.save(product);
        log.info("Venue product created: id={}, venueId={}, name={}", saved.getId(), venueId, request.getName());
        return VenueProductResponse.from(saved);
    }

    public List<VenueProductResponse> getProducts(Long venueId) {
        return venueProductRepository.findByVenueIdAndIsActiveTrueOrderByCreatedAtDesc(venueId)
                .stream()
                .map(VenueProductResponse::from)
                .toList();
    }

    public VenueProductResponse getProduct(Long productId) {
        return VenueProductResponse.from(findActiveById(productId));
    }

    @Transactional
    public VenueProductResponse updateProduct(Long userId, Long venueId, Long productId,
                                               UpdateVenueProductRequest request) {
        validateVenueOwnership(userId, venueId);
        VenueProduct product = findActiveById(productId);

        if (!product.getVenueId().equals(venueId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Product does not belong to this venue");
        }

        // 가격 변경 시 이력 기록
        if (!product.getPricePerHour().equals(request.getPricePerHour())
                || (request.getPricePerDay() != null && !request.getPricePerDay().equals(product.getPricePerDay()))) {
            priceHistoryRepository.save(ProductPriceHistory.builder()
                    .productId(productId)
                    .changedBy(userId)
                    .prevPricePerHour(product.getPricePerHour())
                    .newPricePerHour(request.getPricePerHour())
                    .prevPricePerDay(product.getPricePerDay())
                    .newPricePerDay(request.getPricePerDay())
                    .changeReason(request.getPriceChangeReason())
                    .build());
        }

        product.update(
                request.getName(),
                request.getDescription(),
                request.getPricePerHour(),
                request.getPricePerDay(),
                request.getMaxCapacity(),
                request.getIncludedCameras() != null ? request.getIncludedCameras() : product.getIncludedCameras());

        return VenueProductResponse.from(product);
    }

    @Transactional
    public void deleteProduct(Long userId, Long venueId, Long productId) {
        validateVenueOwnership(userId, venueId);
        VenueProduct product = findActiveById(productId);

        if (!product.getVenueId().equals(venueId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Product does not belong to this venue");
        }

        product.softDelete();
        log.info("Venue product deleted: id={}, venueId={}", productId, venueId);
    }

    public List<TimeSlotResponse> getAvailability(Long productId, LocalDate date) {
        findActiveById(productId);
        int dayOfWeek = date.getDayOfWeek().getValue();

        return venueTimeSlotRepository
                .findByVenueProductIdAndDayOfWeekAndIsAvailableTrue(productId, dayOfWeek)
                .stream()
                .map(TimeSlotResponse::from)
                .toList();
    }

    public List<PriceHistoryResponse> getPriceHistory(Long venueId, Long productId) {
        VenueProduct product = findActiveById(productId);
        if (!product.getVenueId().equals(venueId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Product does not belong to this venue");
        }
        return priceHistoryRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(PriceHistoryResponse::from)
                .toList();
    }

    private void validateVenueOwnership(Long userId, Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Venue not found: " + venueId));

        if (venue.getOwnerId() == null || !venue.getOwnerId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "User does not have permission to manage products for this venue");
        }
    }

    private VenueProduct findActiveById(Long id) {
        return venueProductRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Venue product not found: " + id));
    }
}
