package com.pochak.operation.product.repository;

import com.pochak.operation.product.entity.VenueTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VenueTimeSlotRepository extends JpaRepository<VenueTimeSlot, Long> {

    List<VenueTimeSlot> findByVenueProductIdAndDayOfWeekAndIsAvailableTrue(Long venueProductId, Integer dayOfWeek);

    List<VenueTimeSlot> findByVenueProductIdOrderByDayOfWeekAscStartTimeAsc(Long venueProductId);

    Optional<VenueTimeSlot> findByVenueProductIdAndDayOfWeek(Long venueProductId, Integer dayOfWeek);

    @Query("SELECT s FROM VenueTimeSlot s JOIN com.pochak.operation.product.entity.VenueProduct p ON s.venueProductId = p.id WHERE p.venueId = :venueId")
    List<VenueTimeSlot> findByVenueId(Long venueId);
}
