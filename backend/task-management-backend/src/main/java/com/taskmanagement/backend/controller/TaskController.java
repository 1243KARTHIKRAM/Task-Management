package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.PagedResponse;
import com.taskmanagement.backend.dto.TaskRequest;
import com.taskmanagement.backend.dto.TaskResponse;
import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.security.CustomUserDetails;
import com.taskmanagement.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for handling Task-related endpoints.
 * Provides REST endpoints for CRUD operations on tasks.
 * All endpoints require authentication and operate on the logged-in user's tasks.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Creates a new task for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @param taskRequest the task request containing task details
     * @return the created task as TaskResponse
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse taskResponse = taskService.createTask(taskRequest, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(taskResponse);
    }

    /**
     * Retrieves all tasks for the authenticated user with optional filters and pagination.
     *
     * @param userDetails the authenticated user details
     * @param status optional status filter (PENDING, IN_PROGRESS, COMPLETED)
     * @param priority optional priority filter (LOW, MEDIUM, HIGH)
     * @param dueDate optional due date filter (exact match)
     * @param dueDateBefore optional due date filter (tasks due before this date)
     * @param dueDateAfter optional due date filter (tasks due after this date)
     * @param page the page number (0-based, default 0)
     * @param size the page size (default 10)
     * @param sortBy the field to sort by (default createdAt)
     * @param sortDir the sort direction (ASC or DESC, default DESC)
     * @return paged response containing list of tasks and pagination metadata
     */
    @GetMapping
    public ResponseEntity<PagedResponse<TaskResponse>> getAllTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Task.TaskStatus status,
            @RequestParam(required = false) Task.TaskPriority priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDateBefore,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDateAfter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        // Create Sort object
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        // Create Pageable object
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Check if any filters are provided
        PagedResponse<TaskResponse> pagedResponse;
        
        if (status != null || priority != null || dueDate != null || dueDateBefore != null || dueDateAfter != null) {
            // For due date filters, we need to use the non-paged version and filter in service
            // (dueDate, dueDateBefore, dueDateAfter are not supported in paged version with filters)
            if (dueDate != null || dueDateBefore != null || dueDateAfter != null) {
                // Use non-paged version for due date filters
                List<TaskResponse> tasks = taskService.getTasksByUserWithFilters(
                        userDetails.getId(),
                        status,
                        priority,
                        dueDate,
                        dueDateBefore,
                        dueDateAfter);
                
                // Manual pagination for filtered results
                int start = page * size;
                int end = Math.min(start + size, tasks.size());
                List<TaskResponse> pagedTasks = start > tasks.size() ? 
                        List.of() : tasks.subList(start, end);
                
                pagedResponse = PagedResponse.<TaskResponse>builder()
                        .content(pagedTasks)
                        .page(page)
                        .size(size)
                        .totalElements(tasks.size())
                        .totalPages((int) Math.ceil((double) tasks.size() / size))
                        .hasNext(start + size < tasks.size())
                        .hasPrevious(page > 0)
                        .isFirst(page == 0)
                        .isLast(start + size >= tasks.size())
                        .build();
            } else {
                pagedResponse = taskService.getTasksByUserWithFiltersPaged(
                        userDetails.getId(),
                        status,
                        priority,
                        pageable);
            }
        } else {
            pagedResponse = taskService.getTasksByUserPaged(userDetails.getId(), pageable);
        }
        
        return ResponseEntity.ok(pagedResponse);
    }

    /**
     * Retrieves a specific task by ID for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @param taskId the ID of the task to retrieve
     * @return the task as TaskResponse
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long taskId) {
        TaskResponse taskResponse = taskService.getTaskById(taskId);
        return ResponseEntity.ok(taskResponse);
    }

    /**
     * Updates an existing task for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @param taskId the ID of the task to update
     * @param taskRequest the updated task details
     * @return the updated task as TaskResponse
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse taskResponse = taskService.updateTask(taskId, taskRequest);
        return ResponseEntity.ok(taskResponse);
    }

    /**
     * Deletes a task for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @param taskId the ID of the task to delete
     * @return no content response
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates only the status of a task.
     *
     * @param userDetails the authenticated user details
     * @param taskId the ID of the task to update
     * @param status the new status
     * @return the updated task as TaskResponse
     */
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long taskId,
            @RequestParam Task.TaskStatus status) {
        TaskResponse taskResponse = taskService.updateStatus(taskId, status);
        return ResponseEntity.ok(taskResponse);
    }
}
