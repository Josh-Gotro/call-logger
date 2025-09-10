package com.wai.callform.entity;

import com.wai.callform.validation.ValidProgramManagementHierarchy;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "call_entries")
@Data
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
// @ValidProgramManagementHierarchy // Temporarily disabled to fix auditing issue
public class CallEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "datatech_name", nullable = false)
    private String datatechName;

    @NotNull
    @Email
    @Size(max = 255)
    @Column(name = "datatech_email", nullable = false)
    private String datatechEmail;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    // Boolean fields (required, no nulls allowed)
    @NotNull
    @Column(name = "is_inbound", nullable = false)
    private Boolean isInbound = false;

    @NotNull
    @Column(name = "is_agent", nullable = false)
    private Boolean isAgent = false;

    // Foreign key relationships to reference tables
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_management_parent_id")
    private ProgramManagementItem programManagementParent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_management_child_id")
    private ProgramManagementItem programManagementChild;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryItem category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private SubjectItem subject;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Hierarchical program management validation
    public boolean hasValidProgramManagementHierarchy() {
        // If child is selected, parent must also be selected
        if (programManagementChild != null && programManagementParent == null) {
            return false;
        }
        // If child is selected, it must actually be a child of the selected parent
        if (programManagementChild != null && programManagementParent != null) {
            return programManagementChild.getParent() != null && 
                   programManagementChild.getParent().getId().equals(programManagementParent.getId());
        }
        return true;
    }

    public String getProgramManagementDisplay() {
        if (programManagementParent == null) {
            return null;
        }
        if (programManagementChild != null) {
            return programManagementParent.getName() + " > " + programManagementChild.getName();
        }
        return programManagementParent.getName();
    }

    // Business logic methods
    public boolean isCallInProgress() {
        return startTime != null && endTime == null;
    }

    public boolean isCallCompleted() {
        return startTime != null && endTime != null;
    }

    public long getCallDurationMinutes() {
        if (startTime == null || endTime == null) {
            return 0;
        }
        return java.time.Duration.between(startTime, endTime).toMinutes();
    }
}