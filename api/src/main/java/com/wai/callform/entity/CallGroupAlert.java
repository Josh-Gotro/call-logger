package com.wai.callform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "call_group_alerts")
@Data
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class CallGroupAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Size(max = 100)
    @Column(name = "call_group_id", nullable = false, length = 100)
    private String callGroupId;

    @Size(max = 255)
    @Column(name = "call_group_name", length = 255)
    private String callGroupName;

    @NotNull
    @Size(max = 50)
    @Column(name = "alert_type", nullable = false, length = 50)
    private String alertType;

    @Column(name = "alert_message", columnDefinition = "TEXT")
    private String alertMessage;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    /**
     * Mark the alert as resolved
     */
    public void resolve() {
        this.isActive = false;
        this.resolvedAt = OffsetDateTime.now();
    }

    /**
     * Check if alert is currently active
     */
    public boolean isCurrentlyActive() {
        return isActive && resolvedAt == null;
    }
}
