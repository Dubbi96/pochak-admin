package com.pochak.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DateUtilTest {

    @Test
    @DisplayName("Should return current time in KST zone")
    void testNow() {
        // when
        LocalDateTime now = DateUtil.now();

        // then
        assertThat(now).isNotNull();
        assertThat(now).isBeforeOrEqualTo(LocalDateTime.now().plusHours(24));
    }

    @Test
    @DisplayName("Should format datetime with default pattern yyyy-MM-dd HH:mm:ss")
    void testFormatDefault() {
        // given
        LocalDateTime dateTime = LocalDateTime.of(2026, 3, 15, 14, 30, 0);

        // when
        String formatted = DateUtil.format(dateTime);

        // then
        assertThat(formatted).isEqualTo("2026-03-15 14:30:00");
    }

    @Test
    @DisplayName("Should return null when formatting null datetime")
    void testFormatNull() {
        assertThat(DateUtil.format(null)).isNull();
    }

    @Test
    @DisplayName("Should format datetime with custom pattern")
    void testFormatCustomPattern() {
        // given
        LocalDateTime dateTime = LocalDateTime.of(2026, 1, 5, 9, 5, 30);

        // when
        String formatted = DateUtil.format(dateTime, "yyyy/MM/dd");

        // then
        assertThat(formatted).isEqualTo("2026/01/05");
    }

    @Test
    @DisplayName("Should return null when formatting null datetime with custom pattern")
    void testFormatCustomPatternNull() {
        assertThat(DateUtil.format(null, "yyyy/MM/dd")).isNull();
    }

    @Test
    @DisplayName("Should parse datetime string with default pattern")
    void testParseDefault() {
        // given
        String dateTimeStr = "2026-03-15 14:30:00";

        // when
        LocalDateTime parsed = DateUtil.parse(dateTimeStr);

        // then
        assertThat(parsed).isEqualTo(LocalDateTime.of(2026, 3, 15, 14, 30, 0));
    }

    @Test
    @DisplayName("Should parse datetime string with custom pattern")
    void testParseCustomPattern() {
        // given
        String dateTimeStr = "2026/01/05 09:05";

        // when
        LocalDateTime parsed = DateUtil.parse(dateTimeStr, "yyyy/MM/dd HH:mm");

        // then
        assertThat(parsed).isEqualTo(LocalDateTime.of(2026, 1, 5, 9, 5, 0));
    }

    @Test
    @DisplayName("Should throw exception when parsing invalid date string")
    void testParseInvalid() {
        assertThatThrownBy(() -> DateUtil.parse("not-a-date"))
                .isInstanceOf(java.time.format.DateTimeParseException.class);
    }
}
