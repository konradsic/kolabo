package dev.konradsic.kolabo.dto.ws;

import com.fasterxml.jackson.annotation.JsonTypeName;
import dev.konradsic.kolabo.crdt.Position;

import java.util.UUID;

@JsonTypeName("insert")
public record InsertOp(
    UUID charId, 
    String value, 
    Position position
) implements CrdtOp {}
