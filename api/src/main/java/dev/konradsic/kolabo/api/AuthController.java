package dev.konradsic.kolabo.api;

import dev.konradsic.kolabo.dto.ApiResponse;
import dev.konradsic.kolabo.model.CustomUserDetails;
import dev.konradsic.kolabo.dto.RegisterRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/users/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping(path = "/login")
    public ApiResponse<Object> login(@Valid @RequestBody RegisterRequest body, HttpSession session) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(body.getEmail(), body.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(auth);

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        assert userDetails != null;
        session.setAttribute("user", userDetails.getUser().getId());
        return new ApiResponse<>(true, Map.of("sessionId", session.getId()));
    }
}
