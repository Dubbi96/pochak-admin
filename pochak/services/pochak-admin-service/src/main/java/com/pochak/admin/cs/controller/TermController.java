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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTerm(@PathVariable Long id) {
        termRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
