package com.pochak.content.sport.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.sport.dto.*;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.sport.entity.SportTag;
import com.pochak.content.sport.repository.SportRepository;
import com.pochak.content.sport.repository.SportTagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SportServiceTest {

    @Mock
    private SportRepository sportRepository;

    @Mock
    private SportTagRepository sportTagRepository;

    @InjectMocks
    private SportService sportService;

    private Sport testSport;

    @BeforeEach
    void setUp() {
        testSport = Sport.builder()
                .id(1L)
                .name("Football")
                .nameEn("Football")
                .code("SOCCER")
                .active(true)
                .displayOrder(1)
                .tags(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should list sports with pagination")
    void testListSports() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Sport> page = new PageImpl<>(List.of(testSport), pageable, 1);
        given(sportRepository.findByActive(true, pageable)).willReturn(page);

        // when
        Page<SportListResponse> result = sportService.listSports(true, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Football");
        assertThat(result.getContent().get(0).getCode()).isEqualTo("SOCCER");
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should create a sport successfully")
    void testCreateSport() {
        // given
        CreateSportRequest request = CreateSportRequest.builder()
                .name("Basketball")
                .nameEn("Basketball")
                .code("BASKETBALL")
                .displayOrder(2)
                .build();

        given(sportRepository.existsByCode("BASKETBALL")).willReturn(false);

        Sport savedSport = Sport.builder()
                .id(2L)
                .name("Basketball")
                .nameEn("Basketball")
                .code("BASKETBALL")
                .active(true)
                .displayOrder(2)
                .tags(new ArrayList<>())
                .build();
        given(sportRepository.save(any(Sport.class))).willReturn(savedSport);

        // when
        SportDetailResponse result = sportService.createSport(request);

        // then
        assertThat(result.getName()).isEqualTo("Basketball");
        assertThat(result.getCode()).isEqualTo("BASKETBALL");
        assertThat(result.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when creating sport with duplicate code")
    void testCreateDuplicateCode() {
        // given
        CreateSportRequest request = CreateSportRequest.builder()
                .name("Soccer")
                .code("SOCCER")
                .build();

        given(sportRepository.existsByCode("SOCCER")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> sportService.createSport(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Sport code already exists");
    }

    @Test
    @DisplayName("Should batch update display orders")
    void testUpdateOrder() {
        // given
        Sport sport1 = Sport.builder()
                .id(1L).name("Football").code("SOCCER")
                .displayOrder(1).active(true).tags(new ArrayList<>()).build();
        Sport sport2 = Sport.builder()
                .id(2L).name("Basketball").code("BASKETBALL")
                .displayOrder(2).active(true).tags(new ArrayList<>()).build();

        given(sportRepository.findById(1L)).willReturn(Optional.of(sport1));
        given(sportRepository.findById(2L)).willReturn(Optional.of(sport2));

        UpdateDisplayOrderRequest request = new UpdateDisplayOrderRequest(List.of(
                new UpdateDisplayOrderRequest.OrderEntry(1L, 10),
                new UpdateDisplayOrderRequest.OrderEntry(2L, 20)
        ));

        // when
        sportService.updateDisplayOrders(request);

        // then
        assertThat(sport1.getDisplayOrder()).isEqualTo(10);
        assertThat(sport2.getDisplayOrder()).isEqualTo(20);
    }

    @Test
    @DisplayName("Should return all active sports")
    void getAllActiveSports_success() {
        // given
        given(sportRepository.findByActiveTrueOrderByDisplayOrderAsc())
                .willReturn(List.of(testSport));

        // when
        List<Sport> result = sportService.getAllActiveSports();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Football");
    }

    @Test
    @DisplayName("Should return sport by ID")
    void getSportById_success() {
        // given
        given(sportRepository.findById(1L)).willReturn(Optional.of(testSport));

        // when
        Sport result = sportService.getSportById(1L);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Football");
    }

    @Test
    @DisplayName("Should throw exception when sport not found")
    void getSportById_notFound() {
        // given
        given(sportRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> sportService.getSportById(999L))
                .isInstanceOf(BusinessException.class);
    }
}
