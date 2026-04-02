package com.pochak.content.asset.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Legacy content controller. Endpoints have been moved to:
 * - LiveController (/contents/live)
 * - VodController (/contents/vod)
 * - ClipController (/contents/clips)
 * - TagController (/contents/tags)
 */
@RestController
@RequestMapping("/contents")
public class ContentController {
    // All endpoints have been migrated to dedicated controllers.
}
