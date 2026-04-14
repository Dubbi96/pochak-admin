package com.pochak.commerce.admin.service;

import com.pochak.commerce.admin.dto.*;
import com.pochak.commerce.giftball.entity.GiftBall;
import com.pochak.commerce.giftball.entity.GiftBallStatus;
import com.pochak.commerce.giftball.repository.GiftBallRepository;
import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import com.pochak.commerce.wallet.entity.Wallet;
import com.pochak.commerce.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommerceAdminService {

    private final WalletRepository walletRepository;
    private final PurchaseRepository purchaseRepository;
    private final GiftBallRepository giftBallRepository;

    // ──────────────────────────────────────────────
    // 포인트 집계 (항목 36)
    // ──────────────────────────────────────────────

    /**
     * 전체 포인트 통계 집계.
     * TODO: WalletLedger 테이블에서 CHARGE/USE 유형별 SUM 쿼리로 정확한 집계 구현 필요.
     *       현재는 Wallet 테이블 balance 합산으로 잔여 포인트만 산출.
     */
    public PointsSummaryResponse getPointsSummary() {
        // TODO: walletLedgerRepository.sumByLedgerType(CHARGE) for totalIssuedPoints
        // TODO: walletLedgerRepository.sumByLedgerType(USE) for totalUsedPoints

        List<Wallet> allWallets = walletRepository.findAll();
        long totalUsers = allWallets.size();
        long totalRemaining = allWallets.stream()
                .mapToLong(w -> w.getBalance() != null ? w.getBalance() : 0L)
                .sum();

        return new PointsSummaryResponse(
                totalUsers,
                /* totalIssuedPoints */ null,   // TODO: ledger SUM
                /* totalUsedPoints   */ null,   // TODO: ledger SUM
                totalRemaining
        );
    }

    /**
     * 사용자별 포인트 잔액 목록 (페이징).
     */
    public Page<UserPointsResponse> getUserPoints(Pageable pageable) {
        return walletRepository.findAll(pageable).map(UserPointsResponse::from);
    }

    // ──────────────────────────────────────────────
    // 시즌패스 (항목 37)
    // ──────────────────────────────────────────────

    /**
     * 기간별 시즌패스 판매 통계.
     */
    public SeasonPassStatsResponse getSeasonPassStats(LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.atTime(23, 59, 59) : null;

        Object[] result = purchaseRepository.aggregateByProductTypeAndPeriod(
                ProductType.SEASON_PASS, PurchaseStatus.COMPLETED, fromDt, toDt);

        Long totalSales = result[0] instanceof Long l ? l : ((Number) result[0]).longValue();
        BigDecimal totalRevenue = result[1] instanceof BigDecimal bd ? bd : new BigDecimal(result[1].toString());

        return new SeasonPassStatsResponse(from, to, totalSales, totalRevenue);
    }

    /**
     * 시즌패스 구매 이력 (페이징).
     */
    public Page<SeasonPassHistoryResponse> getSeasonPassHistory(Pageable pageable) {
        return purchaseRepository
                .findByProductTypeOrderByCreatedAtDesc(ProductType.SEASON_PASS, pageable)
                .map(SeasonPassHistoryResponse::from);
    }

    // ──────────────────────────────────────────────
    // 일별 매출 (항목 38)
    // ──────────────────────────────────────────────

    /**
     * 기간별 일별 매출 집계.
     * TODO: 네이티브 쿼리(DATE_TRUNC + GROUP BY)로 DB 레벨 집계 구현 필요.
     *       현재는 인메모리 집계 (소량 데이터 적합).
     */
    public DailyRevenueResponse getDailyRevenue(LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.atTime(23, 59, 59) : null;

        List<Purchase> completed = purchaseRepository.findAll().stream()
                .filter(p -> p.getStatus() == PurchaseStatus.COMPLETED
                        && (fromDt == null || !p.getCreatedAt().isBefore(fromDt))
                        && (toDt == null || !p.getCreatedAt().isAfter(toDt)))
                .toList();

        // TODO: replace with DB-level DATE_TRUNC GROUP BY query
        var grouped = completed.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        p -> p.getCreatedAt().toLocalDate()));

        List<DailyRevenueResponse.DailyEntry> daily = grouped.entrySet().stream()
                .sorted(java.util.Map.Entry.comparingByKey())
                .map(e -> new DailyRevenueResponse.DailyEntry(
                        e.getKey(),
                        e.getValue().stream().map(Purchase::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                        (long) e.getValue().size()))
                .toList();

        BigDecimal totalRevenue = daily.stream()
                .map(DailyRevenueResponse.DailyEntry::revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DailyRevenueResponse(from, to, totalRevenue, daily);
    }

    // ──────────────────────────────────────────────
    // Gift Ball (항목 39)
    // ──────────────────────────────────────────────

    /**
     * Gift Ball 목록 조회 (status 필터, 페이징).
     */
    public Page<GiftBallResponse> getGiftBalls(GiftBallStatus status, Pageable pageable) {
        return giftBallRepository.findForAdmin(status, pageable).map(GiftBallResponse::from);
    }

    /**
     * 관리자 Gift Ball 수동 지급.
     */
    @Transactional
    public GiftBallResponse grantGiftBall(Long senderUserId, Long receiverUserId,
                                           Integer amount, String message) {
        GiftBall gb = GiftBall.builder()
                .senderUserId(senderUserId)
                .receiverUserId(receiverUserId)
                .amount(amount)
                .message(message)
                .status(GiftBallStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        GiftBall saved = giftBallRepository.save(gb);
        log.info("Admin granted gift ball: sender={}, receiver={}, amount={}", senderUserId, receiverUserId, amount);
        return GiftBallResponse.from(saved);
    }
}
