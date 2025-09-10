package com.wai.callform.service;

import com.wai.callform.dto.CategoryItemDto;
import com.wai.callform.dto.ProgramManagementItemDto;
import com.wai.callform.dto.SubjectItemDto;
import com.wai.callform.entity.CategoryItem;
import com.wai.callform.entity.ProgramManagementItem;
import com.wai.callform.entity.SubjectItem;
import com.wai.callform.repository.CategoryItemRepository;
import com.wai.callform.repository.ProgramManagementItemRepository;
import com.wai.callform.repository.SubjectItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReferenceDataService {

    private final ProgramManagementItemRepository programManagementItemRepository;
    private final CategoryItemRepository categoryItemRepository;
    private final SubjectItemRepository subjectItemRepository;

    /**
     * Get all top-level program management items (parents only)
     */
    public List<ProgramManagementItemDto> getProgramManagementParents() {
        List<ProgramManagementItem> parents = programManagementItemRepository.findTopLevelParents();
        return parents.stream().map(this::mapProgramManagementToDto).toList();
    }

    /**
     * Get children of a specific program management parent
     */
    public List<ProgramManagementItemDto> getProgramManagementChildren(UUID parentId) {
        List<ProgramManagementItem> children = programManagementItemRepository.findActiveChildrenByParentId(parentId);
        return children.stream().map(this::mapProgramManagementToDto).toList();
    }

    /**
     * Get complete program management hierarchy (parents with children)
     */
    public List<ProgramManagementItemDto> getProgramManagementHierarchy() {
        List<ProgramManagementItem> parents = programManagementItemRepository.findTopLevelParents();
        List<ProgramManagementItemDto> hierarchy = new ArrayList<>();
        
        for (ProgramManagementItem parent : parents) {
            ProgramManagementItemDto parentDto = mapProgramManagementToDto(parent);
            
            // Get children for this parent
            List<ProgramManagementItem> children = programManagementItemRepository.findActiveChildrenByParentId(parent.getId());
            if (!children.isEmpty()) {
                List<ProgramManagementItemDto> childDtos = children.stream()
                    .map(this::mapProgramManagementToDto)
                    .toList();
                parentDto.setChildren(childDtos);
                parentDto.setHasChildren(true);
            } else {
                parentDto.setChildren(new ArrayList<>());
                parentDto.setHasChildren(false);
            }
            
            hierarchy.add(parentDto);
        }
        
        return hierarchy;
    }

    /**
     * Get all active categories
     */
    public List<CategoryItemDto> getActiveCategories() {
        List<CategoryItem> categories = categoryItemRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc();
        return categories.stream().map(this::mapCategoryToDto).toList();
    }

    /**
     * Get all active subjects
     */
    public List<SubjectItemDto> getActiveSubjects() {
        List<SubjectItem> subjects = subjectItemRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc();
        return subjects.stream().map(this::mapSubjectToDto).toList();
    }

    /**
     * Search program management items by name
     */
    public List<ProgramManagementItemDto> searchProgramManagementByName(String name) {
        List<ProgramManagementItem> items = programManagementItemRepository.findByNameContainingIgnoreCase(name);
        return items.stream().map(this::mapProgramManagementToDto).toList();
    }

    /**
     * Search categories by name
     */
    public List<CategoryItemDto> searchCategoriesByName(String name) {
        List<CategoryItem> categories = categoryItemRepository.findByNameContainingIgnoreCase(name);
        return categories.stream().map(this::mapCategoryToDto).toList();
    }

    /**
     * Search subjects by name
     */
    public List<SubjectItemDto> searchSubjectsByName(String name) {
        List<SubjectItem> subjects = subjectItemRepository.findByNameContainingIgnoreCase(name);
        return subjects.stream().map(this::mapSubjectToDto).toList();
    }

    /**
     * Map ProgramManagementItem entity to DTO
     */
    private ProgramManagementItemDto mapProgramManagementToDto(ProgramManagementItem entity) {
        ProgramManagementItemDto dto = new ProgramManagementItemDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setActive(entity.getIsActive());
        dto.setSortOrder(entity.getSortOrder());
        
        if (entity.getParent() != null) {
            dto.setParentId(entity.getParent().getId());
            dto.setParentName(entity.getParent().getName());
        }
        
        dto.setHasChildren(entity.hasChildren());
        
        return dto;
    }

    /**
     * Map CategoryItem entity to DTO
     */
    private CategoryItemDto mapCategoryToDto(CategoryItem entity) {
        CategoryItemDto dto = new CategoryItemDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setActive(entity.getIsActive());
        dto.setSortOrder(entity.getSortOrder());
        return dto;
    }

    /**
     * Map SubjectItem entity to DTO
     */
    private SubjectItemDto mapSubjectToDto(SubjectItem entity) {
        SubjectItemDto dto = new SubjectItemDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setActive(entity.getIsActive());
        dto.setSortOrder(entity.getSortOrder());
        return dto;
    }
}