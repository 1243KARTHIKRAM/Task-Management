package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.AuthResponse;
import com.taskmanagement.backend.dto.LoginRequest;
import com.taskmanagement.backend.dto.RegisterRequest;
import com.taskmanagement.backend.entity.User;
import com.taskmanagement.backend.exception.BadRequestException;
import com.taskmanagement.backend.exception.ResourceNotFoundException;
import com.taskmanagement.backend.repository.UserRepository;
import com.taskmanagement.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class for handling authentication operations.
 * Provides methods for user registration and login using BCrypt password hashing and JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user with the provided registration request.
     * Uses BCrypt to hash the password before storing.
     *
     * @param request the registration request containing user details
     * @return AuthResponse containing the JWT token and user information
     * @throws BadRequestException if the email is already registered
     */
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        // Create new user with hashed password
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        // Save user to database
        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return AuthResponse.fromUser(savedUser, token);
    }

    /**
     * Authenticates a user with the provided login credentials.
     * Uses BCrypt to verify the password and generates a JWT token on success.
     *
     * @param request the login request containing email and password
     * @return AuthResponse containing the JWT token and user information
     * @throws ResourceNotFoundException if the user is not found
     * @throws BadRequestException if the password is incorrect
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Authenticate with Spring Security AuthenticationManager
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadRequestException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.fromUser(user, token);
    }
}
