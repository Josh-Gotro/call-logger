package com.wai.callform.repository;

import com.wai.callform.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for TaskEntity operations.
 * Provides CRUD operations and custom queries for tasks.
 */
@Repository
public interface TaskEntityRepository extends JpaRepository<TaskEntity, UUID> {

    // Find all active tasks ordered by sort order and name
    List<TaskEntity> findByIsActiveTrueOrderBySortOrderAscNameAsc();

    // Find all tasks (including inactive) ordered by sort order and name
    List<TaskEntity> findAllByOrderBySortOrderAscNameAsc();

    // Find task by exact name (case-insensitive)
    @Query("SELECT t FROM TaskEntity t WHERE LOWER(t.name) = LOWER(:name)")
    Optional<TaskEntity> findByNameIgnoreCase(@Param("name") String name);

    // Find tasks by partial name match (case-insensitive)
    @Query("SELECT t FROM TaskEntity t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%')) AND t.isActive = true ORDER BY t.sortOrder ASC, t.name ASC")
    List<TaskEntity> findByNameContainingIgnoreCase(@Param("name") String name);

    // Check if task name exists (for uniqueness validation)
    @Query("SELECT COUNT(t) > 0 FROM TaskEntity t WHERE LOWER(t.name) = LOWER(:name) AND t.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("excludeId") UUID excludeId);

    // Check if task name exists (for creation validation)
    @Query("SELECT COUNT(t) > 0 FROM TaskEntity t WHERE LOWER(t.name) = LOWER(:name)")
    boolean existsByNameIgnoreCase(@Param("name") String name);

    // Find the maximum sort order for new item placement
    @Query("SELECT COALESCE(MAX(t.sortOrder), 0) FROM TaskEntity t")
    Integer findMaxSortOrder();

    // Find tasks that have subjects
    @Query("SELECT DISTINCT t FROM TaskEntity t LEFT JOIN FETCH t.subjects WHERE t.isActive = true AND SIZE(t.subjects) > 0 ORDER BY t.sortOrder ASC, t.name ASC")
    List<TaskEntity> findTasksWithSubjects();

    // Find tasks without subjects
    @Query("SELECT t FROM TaskEntity t WHERE t.isActive = true AND SIZE(t.subjects) = 0 ORDER BY t.sortOrder ASC, t.name ASC")
    List<TaskEntity> findTasksWithoutSubjects();

    // Load task with subjects eagerly
    @Query("SELECT t FROM TaskEntity t LEFT JOIN FETCH t.subjects WHERE t.id = :taskId")
    Optional<TaskEntity> findByIdWithSubjects(@Param("taskId") UUID taskId);

    // Count active tasks
    long countByIsActiveTrue();
}