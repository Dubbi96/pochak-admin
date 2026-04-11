package com.pochak.content.favorite.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.favorite.dto.AddFavoriteRequest;
import com.pochak.content.favorite.dto.FavoriteResponse;
import com.pochak.content.favorite.entity.Favorite;
import com.pochak.content.favorite.repository.FavoriteRepository;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    @Test
    @DisplayName("Should return paginated favorites for a user")
    void testGetFavorites() {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        Favorite fav = Favorite.builder()
                .id(1L).userId(1L).targetType("VOD").targetId(100L).build();
        Page<Favorite> page = new PageImpl<>(List.of(fav), pageable, 1);

        given(favoriteRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable)).willReturn(page);

        // when
        Page<FavoriteResponse> result = favoriteService.getFavorites(1L, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTargetType()).isEqualTo("VOD");
        assertThat(result.getContent().get(0).getTargetId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("Should add a new favorite successfully")
    void testAddFavorite() {
        // given
        AddFavoriteRequest request = AddFavoriteRequest.builder()
                .contentType("CLIP").contentId(50L).build();

        given(favoriteRepository.existsByUserIdAndTargetTypeAndTargetId(1L, "CLIP", 50L))
                .willReturn(false);

        Favorite saved = Favorite.builder()
                .id(1L).userId(1L).targetType("CLIP").targetId(50L).build();
        given(favoriteRepository.save(any(Favorite.class))).willReturn(saved);

        // when
        FavoriteResponse response = favoriteService.addFavorite(1L, request);

        // then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTargetType()).isEqualTo("CLIP");
    }

    @Test
    @DisplayName("Should throw exception when adding duplicate favorite")
    void testAddFavoriteDuplicate() {
        // given
        AddFavoriteRequest request = AddFavoriteRequest.builder()
                .contentType("VOD").contentId(10L).build();

        given(favoriteRepository.existsByUserIdAndTargetTypeAndTargetId(1L, "VOD", 10L))
                .willReturn(true);

        // when / then
        assertThatThrownBy(() -> favoriteService.addFavorite(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Already added to favorites");
    }

    @Test
    @DisplayName("Should remove favorite owned by user")
    void testRemoveFavorite() {
        // given
        Favorite fav = Favorite.builder()
                .id(1L).userId(1L).targetType("VOD").targetId(10L).build();

        given(favoriteRepository.findById(1L)).willReturn(Optional.of(fav));

        // when
        favoriteService.removeFavorite(1L, 1L);

        // then
        then(favoriteRepository).should().delete(fav);
    }

    @Test
    @DisplayName("Should throw exception when removing non-existent favorite")
    void testRemoveFavoriteNotFound() {
        // given
        given(favoriteRepository.findById(99L)).willReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> favoriteService.removeFavorite(1L, 99L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Favorite not found");
    }

    @Test
    @DisplayName("Should throw exception when removing another user's favorite")
    void testRemoveFavoriteForbidden() {
        // given
        Favorite fav = Favorite.builder()
                .id(1L).userId(2L).targetType("VOD").targetId(10L).build();

        given(favoriteRepository.findById(1L)).willReturn(Optional.of(fav));

        // when / then
        assertThatThrownBy(() -> favoriteService.removeFavorite(1L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot delete another user's favorite");
    }
}
