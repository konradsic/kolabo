package dev.konradsic.kolabo.dao;

import dev.konradsic.kolabo.model.DocumentMember;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface DocumentMemberDao extends JpaRepository<DocumentMember, UUID> {
    List<DocumentMember> findByDocumentId(UUID documentId);
    List<DocumentMember> findByUserId(UUID userId);

    @NullMarked
    Optional<DocumentMember> findByDocumentIdAndUserId(UUID documentId, UUID userId);
}
