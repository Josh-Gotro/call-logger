package com.wai.callform.repository;

import com.wai.callform.entity.CallGroupAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CallGroupAlertRepository extends JpaRepository<CallGroupAlert, UUID> {

    /**
     * Find all active alerts
     */
    List<CallGroupAlert> findByIsActiveTrue();

    /**
     * Find active alert for a specific call group
     */
    Optional<CallGroupAlert> findByCallGroupIdAndIsActiveTrue(String callGroupId);

    /**
     * Find all alerts for a call group (active and resolved)
     */
    List<CallGroupAlert> findByCallGroupIdOrderByCreatedAtDesc(String callGroupId);

    /**
     * Find alerts by type
     */
    List<CallGroupAlert> findByAlertTypeAndIsActiveTrue(String alertType);

    /**
     * Check if there's an active alert for a call group
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM CallGroupAlert a " +
           "WHERE a.callGroupId = :callGroupId AND a.isActive = true")
    boolean existsActiveAlertForCallGroup(String callGroupId);
}
