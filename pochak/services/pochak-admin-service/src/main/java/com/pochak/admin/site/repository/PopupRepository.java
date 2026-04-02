package com.pochak.admin.site.repository;

import com.pochak.admin.site.entity.Popup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PopupRepository extends JpaRepository<Popup, Long> {

    List<Popup> findByIsActiveTrue();
}
