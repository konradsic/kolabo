package dev.konradsic.kolabo.dao;

import dev.konradsic.kolabo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;


public interface UserDao extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}
