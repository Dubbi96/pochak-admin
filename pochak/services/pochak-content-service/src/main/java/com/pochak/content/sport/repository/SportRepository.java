package com.pochak.content.sport.repository;

import com.pochak.content.sport.entity.Sport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SportRepository extends JpaRepository<Sport, Long> {

    List<Sport> findByActiveTrueOrderByDisplayOrderAsc();

    Page<Sport> findByActive(Boolean active, Pageable pageable);

    Page<Sport> findAll(Pageable pageable);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Sport> findByCode(String code);
}
