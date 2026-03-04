package com.taskmanagement.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Generic paged response DTO that contains pagination metadata.
 * 
 * @param <T> the type of content in the page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    /**
     * The list of content items in the current page.
     */
    private List<T> content;

    /**
     * The current page number (0-based).
     */
    private int page;

    /**
     * The size of the page (number of elements per page).
     */
    private int size;

    /**
     * The total number of elements available.
     */
    private long totalElements;

    /**
     * The total number of pages available.
     */
    private int totalPages;

    /**
     * Whether there is a next page.
     */
    private boolean hasNext;

    /**
     * Whether there is a previous page.
     */
    private boolean hasPrevious;

    /**
     * Whether this is the first page.
     */
    private boolean isFirst;

    /**
     * Whether this is the last page.
     */
    private boolean isLast;
}
