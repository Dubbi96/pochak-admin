package com.pochak.admin.site.repository;

import com.pochak.admin.site.entity.PushCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PushCampaignRepository extends JpaRepository<PushCampaign, Long> {
}
