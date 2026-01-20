package dev.konradsic.kolabo.dto.ws;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.UUID;

@JsonTypeName("caretUpdate")
public record CaretUpdate(
    int offset
) implements WsMessage {}
