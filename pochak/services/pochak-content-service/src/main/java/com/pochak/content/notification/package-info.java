/**
 * Notification module - currently housed in content-service for simplicity.
 *
 * This module manages user notifications across all service domains.
 * It receives notification requests from other services and delivers them to users.
 *
 * Future consideration: Extract into a dedicated pochak-notification-service
 * when notification complexity grows (push notifications, email, etc.).
 */
package com.pochak.content.notification;
