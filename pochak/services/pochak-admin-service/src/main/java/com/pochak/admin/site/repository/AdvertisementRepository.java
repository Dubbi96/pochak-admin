package com.pochak.admin.site.repository;

import com.pochak.admin.site.entity.Advertisement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {

    List<Advertisement> findByIsActiveTrue();
}
