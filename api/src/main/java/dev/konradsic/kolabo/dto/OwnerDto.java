package dev.konradsic.kolabo.dto;

import java.util.UUID;

public record OwnerDto (
    UUID id,
    String email
) {}
