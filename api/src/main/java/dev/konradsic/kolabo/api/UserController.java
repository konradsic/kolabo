package dev.konradsic.kolabo.api;

import dev.konradsic.kolabo.dto.UserDto;
import dev.konradsic.kolabo.exceptions.UnauthorizedException;
import dev.konradsic.kolabo.dto.ApiResponse;
import dev.konradsic.kolabo.dto.RegisterRequest;
import dev.konradsic.kolabo.model.User;
import dev.konradsic.kolabo.service.UserMapper;
import dev.konradsic.kolabo.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final HttpSession session;
    private final UserMapper userMapper;

    public UserController(UserService userService, HttpSession session, UserMapper userMapper) {
        this.userService = userService;
        this.session = session;
        this.userMapper = userMapper;
    }

    @PostMapping(path = "/register")
    public ApiResponse<Object> register(@Valid @RequestBody RegisterRequest body) {
        userService.register(body.getEmail(), body.getPassword());
        return new ApiResponse<>(true, Map.of("message", "User registered successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(HttpSession session) {
        UUID userId = (UUID) session.getAttribute("user");
        if (userId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        User user = userService.findById(userId);

        UserDto userDto = userMapper.toDto(user);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/logout")
    public ApiResponse<Object> logout() {
        session.invalidate();
        return new ApiResponse<>(true, Map.of("message", "User logged out"));
    }
}
