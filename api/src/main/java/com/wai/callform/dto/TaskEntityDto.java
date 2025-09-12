package com.wai.callform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Data Transfer Object for TaskEntity.
 * Used for API responses and requests.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskEntityDto {
    
    private UUID id;
    private String name;
    private Boolean isActive;
    private Integer sortOrder;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Simplified subject information (just IDs and names for UI)
    private Set<SubjectReferenceDto> subjects;
    
    // Additional computed fields
    private Integer subjectCount;
    private Boolean hasSubjects;
    
    /**
     * Simplified subject reference for nested display
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectReferenceDto {
        private UUID id;
        private String name;
        private Integer sortOrder;
    }
}