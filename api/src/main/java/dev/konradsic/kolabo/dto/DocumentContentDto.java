package dev.konradsic.kolabo.dto;

import dev.konradsic.kolabo.model.LinkAccessRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentContentDto (
        UUID id,
        String title,
        LocalDateTime createdAt,
        LinkAccessRole linkAccessRole,
        OwnerDto owner
) {}
