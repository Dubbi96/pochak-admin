package com.pochak.admin.site.controller;

import com.pochak.admin.site.entity.PushCampaign;
import com.pochak.admin.site.repository.PushCampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/admin/api/v1/site/push-campaigns")
@RequiredArgsConstructor
public class PushCampaignController {

    private final PushCampaignRepository pushCampaignRepository;

    @GetMapping
    public ResponseEntity<Page<PushCampaign>> getPushCampaigns(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(pushCampaignRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PushCampaign> getPushCampaign(@PathVariable Long id) {
        PushCampaign campaign = pushCampaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PushCampaign not found: " + id));
        return ResponseEntity.ok(campaign);
    }

    @PostMapping
    public ResponseEntity<PushCampaign> createPushCampaign(@RequestBody PushCampaign campaign) {
        PushCampaign saved = pushCampaignRepository.save(campaign);
        return ResponseEntity.created(URI.create("/admin/api/v1/site/push-campaigns/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<PushCampaign> cancelPushCampaign(@PathVariable Long id) {
        PushCampaign campaign = pushCampaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PushCampaign not found: " + id));
        campaign.cancel();
        PushCampaign saved = pushCampaignRepository.save(campaign);
        return ResponseEntity.ok(saved);
    }
}
