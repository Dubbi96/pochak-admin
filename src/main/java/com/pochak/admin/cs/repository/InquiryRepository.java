package com.pochak.admin.cs.repository;

import com.pochak.admin.cs.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
