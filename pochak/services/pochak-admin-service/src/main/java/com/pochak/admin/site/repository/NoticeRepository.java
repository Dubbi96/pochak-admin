package com.pochak.admin.site.repository;

import com.pochak.admin.site.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    Page<Notice> findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);
}
