package com.pochak.operation.venue.repository;

import com.pochak.operation.venue.entity.VenueClosedDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueClosedDayRepository extends JpaRepository<VenueClosedDay, Long> {

    List<VenueClosedDay> findByVenueId(Long venueId);

    void deleteByVenueId(Long venueId);
}
