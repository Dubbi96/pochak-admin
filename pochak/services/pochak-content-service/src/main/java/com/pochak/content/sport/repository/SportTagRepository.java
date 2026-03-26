package com.pochak.content.sport.repository;

import com.pochak.content.sport.entity.SportTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportTagRepository extends JpaRepository<SportTag, Long> {

    List<SportTag> findBySportId(Long sportId);

    List<SportTag> findBySportIdOrderByTagAsc(Long sportId);
}
