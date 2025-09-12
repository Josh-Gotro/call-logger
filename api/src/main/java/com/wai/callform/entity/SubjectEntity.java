package com.wai.callform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entity representing a Subject that can be associated with tasks.
 * Subjects like "Redline", "MLR", "OLE Request" can belong to multiple tasks.
 */
@Entity
@Table(name = "subject_entities")
@Data
@EqualsAndHashCode(of = "id")
@ToString(exclude = "tasks")
public class SubjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Subject name is required")
    @Size(max = 100, message = "Subject name cannot exceed 100 characters")
    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private java.time.OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.OffsetDateTime updatedAt;

    // Many-to-Many relationship with TaskEntity (inverse side)
    @ManyToMany(mappedBy = "subjects")
    private Set<TaskEntity> tasks = new HashSet<>();

    // Business logic methods
    public boolean isAssociatedWithTask(UUID taskId) {
        return tasks != null && tasks.stream()
            .anyMatch(task -> task.getId().equals(taskId));
    }

    public int getTaskCount() {
        return tasks != null ? tasks.size() : 0;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = java.time.OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = java.time.OffsetDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.OffsetDateTime.now();
    }
}