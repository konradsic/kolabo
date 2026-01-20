package dev.konradsic.kolabo.dto.ws;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = CrdtOp.class),
    @JsonSubTypes.Type(value = CaretUpdate.class, name = "caretUpdate")
})
public sealed interface WsMessage permits CaretUpdate, CrdtOp {}
