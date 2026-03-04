package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.AuthResponse;
import com.taskmanagement.backend.dto.LoginRequest;
import com.taskmanagement.backend.dto.RegisterRequest;
import com.taskmanagement.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling authentication endpoints.
 * Provides REST endpoints for user registration and login.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint for user registration.
     *
     * @param request the registration request containing user details
     * @return AuthResponse containing the JWT token and user information
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint for user login.
     *
     * @param request the login request containing email and password
     * @return AuthResponse containing the JWT token and user information
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
