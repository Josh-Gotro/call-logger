package com.wai.callform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entity representing a Task (e.g., IFQ, GAF, Crab, etc.)
 * Tasks can have zero or many associated subjects.
 */
@Entity
@Table(name = "task_entities")
@Data
@EqualsAndHashCode(of = "id")
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Task name is required")
    @Size(max = 100, message = "Task name cannot exceed 100 characters")
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

    // Many-to-Many relationship with SubjectEntity
    @ManyToMany
    @JoinTable(
        name = "task_subject_relationships",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<SubjectEntity> subjects = new HashSet<>();

    // Business logic methods
    public boolean hasSubjects() {
        return subjects != null && !subjects.isEmpty();
    }

    public int getSubjectCount() {
        return subjects != null ? subjects.size() : 0;
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