package dev.konradsic.kolabo.crdt.op;

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
public sealed interface CrdtOp permits InsertOp, DeleteOp {}

