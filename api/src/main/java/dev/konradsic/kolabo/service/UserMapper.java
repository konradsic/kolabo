package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dto.UserDto;
import dev.konradsic.kolabo.model.User;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {

    public UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}
