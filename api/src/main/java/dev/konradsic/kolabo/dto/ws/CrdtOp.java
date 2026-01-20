package dev.konradsic.kolabo.dto.ws;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = InsertOp.class, name = "insert"),
    @JsonSubTypes.Type(value = DeleteOp.class, name = "delete")
})
public sealed interface CrdtOp extends WsMessage permits InsertOp, DeleteOp {}

