package dev.konradsic.kolabo.dao;

import dev.konradsic.kolabo.model.Document;
import dev.konradsic.kolabo.model.User;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface DocumentDao extends JpaRepository<Document, UUID> {
    List<Document> findAllByOwner(User user);

    @NullMarked
    Optional<Document> findById(UUID id);
}
