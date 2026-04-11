package com.pochak.admin.cs.controller;

import com.pochak.admin.cs.entity.Term;
import com.pochak.admin.cs.repository.TermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/cs/terms")
@RequiredArgsConstructor
public class TermController {

    private final TermRepository termRepository;

    @GetMapping
    public ResponseEntity<List<Term>> getTerms() {
        return ResponseEntity.ok(termRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Term> getTerm(@PathVariable Long id) {
        Term term = termRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Term not found: " + id));
        return ResponseEntity.ok(term);
    }

    @PostMapping
    public ResponseEntity<Term> createTerm(@RequestBody Term term) {
        Term saved = termRepository.save(term);
        return ResponseEntity.created(URI.create("/admin/api/v1/cs/terms/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Term> updateTerm(@PathVariable Long id, @RequestBody Term patch) {
        Term existing = termRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Term not found: " + id));
        Term updated = Term.builder()
                .id(existing.getId())
                .termType(patch.getTermType() != null ? patch.getTermType() : existing.getTermType())
                .title(patch.getTitle() != null ? patch.getTitle() : existing.getTitle())
                .content(patch.getContent() != null ? patch.getContent() : existing.getContent())
                .version(patch.getVersion() != null ? patch.getVersion() : existing.getVersion())
                .isRequired(patch.getIsRequired() != null ? patch.getIsRequired() : existing.getIsRequired())
                .isActive(patch.getIsActive() != null ? patch.getIsActive() : existing.getIsActive())
                .effectiveAt(patch.getEffectiveAt() != null ? patch.getEffectiveAt() : existing.getEffectiveAt())
                .build();
        return ResponseEntity.ok(termRepository.save(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTerm(@PathVariable Long id) {
        termRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
