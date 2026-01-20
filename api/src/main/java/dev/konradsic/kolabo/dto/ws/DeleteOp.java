package dev.konradsic.kolabo.dto.ws;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.UUID;

@JsonTypeName("delete")
public record DeleteOp(UUID charId) implements CrdtOp {}
