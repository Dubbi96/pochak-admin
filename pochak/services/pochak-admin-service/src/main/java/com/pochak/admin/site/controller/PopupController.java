package com.pochak.admin.site.controller;

import com.pochak.admin.site.entity.Popup;
import com.pochak.admin.site.repository.PopupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/site/popups")
@RequiredArgsConstructor
public class PopupController {

    private final PopupRepository popupRepository;

    @GetMapping
    public ResponseEntity<List<Popup>> getPopups() {
        return ResponseEntity.ok(popupRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Popup> getPopup(@PathVariable Long id) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Popup not found: " + id));
        return ResponseEntity.ok(popup);
    }

    @PostMapping
    public ResponseEntity<Popup> createPopup(@RequestBody Popup popup) {
        Popup saved = popupRepository.save(popup);
        return ResponseEntity.created(URI.create("/admin/api/v1/site/popups/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePopup(@PathVariable Long id) {
        popupRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
