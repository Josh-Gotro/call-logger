package com.wai.callform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Data Transfer Object for SubjectEntity.
 * Used for API responses and requests.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectEntityDto {
    
    private UUID id;
    private String name;
    private Boolean isActive;
    private Integer sortOrder;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Task associations (simplified for UI)
    private Set<TaskReferenceDto> tasks;
    
    // Additional computed fields
    private Integer taskCount;
    private Boolean isAssignedToTasks;
    
    /**
     * Simplified task reference for nested display
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskReferenceDto {
        private UUID id;
        private String name;
        private Integer sortOrder;
    }
}