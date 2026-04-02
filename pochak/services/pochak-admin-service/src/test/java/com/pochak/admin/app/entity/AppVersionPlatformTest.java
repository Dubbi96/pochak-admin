package com.pochak.admin.app.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AppVersionPlatformTest {

    @Test
    @DisplayName("L7: Platform enum contains AOS and IOS")
    void testPlatformEnumValues() {
        Platform[] values = Platform.values();
        assertEquals(2, values.length);
        assertEquals(Platform.AOS, Platform.valueOf("AOS"));
        assertEquals(Platform.IOS, Platform.valueOf("IOS"));
    }

    @Test
    @DisplayName("L7: Invalid platform value throws IllegalArgumentException")
    void testInvalidPlatform() {
        assertThrows(IllegalArgumentException.class, () -> Platform.valueOf("ANDROID"));
        assertThrows(IllegalArgumentException.class, () -> Platform.valueOf("WEB"));
        assertThrows(IllegalArgumentException.class, () -> Platform.valueOf(""));
    }

    @Test
    @DisplayName("L7: AppVersion with AOS platform builds correctly")
    void testAppVersion_aosPlatform() {
        AppVersion version = AppVersion.builder()
                .id(1L)
                .platform("AOS")
                .versionCode("100")
                .versionName("1.0.0")
                .build();

        assertEquals("AOS", version.getPlatform());
    }

    @Test
    @DisplayName("L7: AppVersion with IOS platform builds correctly")
    void testAppVersion_iosPlatform() {
        AppVersion version = AppVersion.builder()
                .id(2L)
                .platform("IOS")
                .versionCode("200")
                .versionName("2.0.0")
                .build();

        assertEquals("IOS", version.getPlatform());
    }

    @Test
    @DisplayName("L7: Platform enum values match expected platform strings")
    void testPlatformEnumMatchesExpectedStrings() {
        assertEquals("AOS", Platform.AOS.name());
        assertEquals("IOS", Platform.IOS.name());
    }
}
