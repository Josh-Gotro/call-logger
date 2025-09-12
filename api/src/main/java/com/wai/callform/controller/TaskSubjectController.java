package com.wai.callform.controller;

import com.wai.callform.dto.SubjectEntityDto;
import com.wai.callform.dto.TaskEntityDto;
import com.wai.callform.service.TaskSubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing Tasks and Subjects in the fisheries data collection system.
 * Replaces the old ReferenceDataController with the new Task-Subject many-to-many model.
 */
@RestController
@RequestMapping("/api/tasks-subjects")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskSubjectController {

    private final TaskSubjectService taskSubjectService;

    /**
     * Get all active tasks with their associated subjects
     */
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskEntityDto>> getAllTasks() {
        log.info("Fetching all active tasks");
        List<TaskEntityDto> tasks = taskSubjectService.getAllActiveTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get all active subjects
     */
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectEntityDto>> getAllSubjects() {
        log.info("Fetching all active subjects");
        List<SubjectEntityDto> subjects = taskSubjectService.getAllActiveSubjects();
        return ResponseEntity.ok(subjects);
    }

    /**
     * Get subjects for a specific task
     */
    @GetMapping("/tasks/{taskId}/subjects")
    public ResponseEntity<List<SubjectEntityDto>> getSubjectsForTask(
            @PathVariable UUID taskId) {
        log.info("Fetching subjects for task: {}", taskId);
        List<SubjectEntityDto> subjects = taskSubjectService.getSubjectsForTask(taskId);
        return ResponseEntity.ok(subjects);
    }

    /**
     * Get a specific task with its subjects
     */
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskEntityDto> getTaskById(
            @PathVariable UUID taskId) {
        log.info("Fetching task by ID: {}", taskId);
        TaskEntityDto task = taskSubjectService.getTaskById(taskId);
        return ResponseEntity.ok(task);
    }

    /**
     * Validate if a subject is valid for a task
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateTaskSubjectRelationship(
            @RequestParam UUID taskId,
            @RequestParam UUID subjectId) {
        log.info("Validating task-subject relationship: task={}, subject={}", taskId, subjectId);
        boolean isValid = taskSubjectService.isSubjectValidForTask(taskId, subjectId);
        return ResponseEntity.ok(isValid);
    }

    /**
     * Create a new task (admin function)
     */
    @PostMapping("/tasks")
    public ResponseEntity<TaskEntityDto> createTask(
            @RequestParam String name,
            @RequestParam(required = false) Integer sortOrder) {
        log.info("Creating new task: {}", name);
        TaskEntityDto task = taskSubjectService.createTask(name, sortOrder);
        return ResponseEntity.ok(task);
    }

    /**
     * Create a new subject (admin function)
     */
    @PostMapping("/subjects")
    public ResponseEntity<SubjectEntityDto> createSubject(
            @RequestParam String name,
            @RequestParam(required = false) Integer sortOrder) {
        log.info("Creating new subject: {}", name);
        SubjectEntityDto subject = taskSubjectService.createSubject(name, sortOrder);
        return ResponseEntity.ok(subject);
    }

    /**
     * Get reference data summary for dashboard/overview
     */
    @GetMapping("/summary")
    public ResponseEntity<TaskSubjectSummary> getTaskSubjectSummary() {
        log.info("Fetching task-subject summary");
        
        List<TaskEntityDto> tasks = taskSubjectService.getAllActiveTasks();
        List<SubjectEntityDto> subjects = taskSubjectService.getAllActiveSubjects();
        
        long totalTasks = tasks.size();
        long totalSubjects = subjects.size();
        long totalRelationships = tasks.stream()
            .mapToLong(task -> task.getSubjects().size())
            .sum();

        TaskSubjectSummary summary = new TaskSubjectSummary(
            totalTasks, totalSubjects, totalRelationships, tasks, subjects
        );
        
        return ResponseEntity.ok(summary);
    }

    /**
     * Summary DTO for task-subject overview
     */
    public record TaskSubjectSummary(
        long totalTasks,
        long totalSubjects, 
        long totalRelationships,
        List<TaskEntityDto> tasks,
        List<SubjectEntityDto> subjects
    ) {}
}