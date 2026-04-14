package com.pochak.admin.cs.repository;

import com.pochak.admin.cs.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    /** 사용자향: 활성 FAQ를 카테고리로 필터링해 sortOrder 순 조회 */
    List<Faq> findByActiveTrueOrderByCategoryAscSortOrderAsc();

    List<Faq> findByCategoryAndActiveTrueOrderBySortOrderAsc(String category);
}
