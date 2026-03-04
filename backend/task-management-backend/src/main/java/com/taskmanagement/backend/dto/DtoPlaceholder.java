package com.taskmanagement.backend.dto;

/**
 * DTO (Data Transfer Object) layer - Data carriers.
 * 
 * Purpose:
 * - Transfers data between layers (controller ↔ service ↔ client)
 * - Hides internal entity structure from external clients
 * - Reduces over-fetching by exposing only required fields
 * - Used for request/response payloads
 * - Can include validation annotations (@NotNull, @Size, etc.)
 */
public class DtoPlaceholder {
    // DTOs are simple POJOs with getters/setters
    // Example: TaskRequestDTO, TaskResponseDTO, UserDTO
}
