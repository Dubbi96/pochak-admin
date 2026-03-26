package com.pochak.admin.cs.repository;

import com.pochak.admin.cs.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TermRepository extends JpaRepository<Term, Long> {

    List<Term> findByTermTypeAndIsActiveTrueOrderByVersionDesc(String termType);

    List<Term> findByIsActiveTrue();
}
