package com.wai.callform.controller;

import com.wai.callform.dto.CategoryItemDto;
import com.wai.callform.dto.ProgramManagementItemDto;
import com.wai.callform.dto.SubjectItemDto;
import com.wai.callform.service.ReferenceDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
@Slf4j
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    /**
     * Get all top-level program management items (parents only)
     */
    @GetMapping("/program-management")
    public ResponseEntity<List<ProgramManagementItemDto>> getProgramManagementParents() {
        log.debug("Getting program management parent items");
        List<ProgramManagementItemDto> parents = referenceDataService.getProgramManagementParents();
        return ResponseEntity.ok(parents);
    }

    /**
     * Get children of a specific program management parent
     */
    @GetMapping("/program-management/{parentId}/children")
    public ResponseEntity<List<ProgramManagementItemDto>> getProgramManagementChildren(@PathVariable UUID parentId) {
        log.debug("Getting program management children for parent ID: {}", parentId);
        List<ProgramManagementItemDto> children = referenceDataService.getProgramManagementChildren(parentId);
        return ResponseEntity.ok(children);
    }

    /**
     * Get program management hierarchy (parents with their children)
     */
    @GetMapping("/program-management/hierarchy")
    public ResponseEntity<List<ProgramManagementItemDto>> getProgramManagementHierarchy() {
        log.debug("Getting complete program management hierarchy");
        List<ProgramManagementItemDto> hierarchy = referenceDataService.getProgramManagementHierarchy();
        return ResponseEntity.ok(hierarchy);
    }

    /**
     * Get all active categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryItemDto>> getCategories() {
        log.debug("Getting all active categories");
        List<CategoryItemDto> categories = referenceDataService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get all active subjects
     */
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectItemDto>> getSubjects() {
        log.debug("Getting all active subjects");
        List<SubjectItemDto> subjects = referenceDataService.getActiveSubjects();
        return ResponseEntity.ok(subjects);
    }

    /**
     * Search program management items by name
     */
    @GetMapping("/program-management/search")
    public ResponseEntity<List<ProgramManagementItemDto>> searchProgramManagement(@RequestParam String name) {
        log.debug("Searching program management items with name: {}", name);
        List<ProgramManagementItemDto> results = referenceDataService.searchProgramManagementByName(name);
        return ResponseEntity.ok(results);
    }

    /**
     * Search categories by name
     */
    @GetMapping("/categories/search")
    public ResponseEntity<List<CategoryItemDto>> searchCategories(@RequestParam String name) {
        log.debug("Searching categories with name: {}", name);
        List<CategoryItemDto> results = referenceDataService.searchCategoriesByName(name);
        return ResponseEntity.ok(results);
    }

    /**
     * Search subjects by name
     */
    @GetMapping("/subjects/search")
    public ResponseEntity<List<SubjectItemDto>> searchSubjects(@RequestParam String name) {
        log.debug("Searching subjects with name: {}", name);
        List<SubjectItemDto> results = referenceDataService.searchSubjectsByName(name);
        return ResponseEntity.ok(results);
    }
}