package dev.konradsic.kolabo.crdt;

import java.util.UUID;

public class Character {
    private UUID id;
    private final String value;
    private final Position position;
    private CharacterMetadata metadata;

    public Character(String value, Position position) {
        this.id = UUID.randomUUID();
        this.value = value;
        this.position = position;
        this.metadata = new CharacterMetadata();
    }

    public UUID getId() { return id; }
    public String getValue() { return value; }
    public Position getPosition() { return position; }
    public CharacterMetadata getMetadata() { return metadata; }

    public void setId(UUID id) { this.id = id; }
    public void setMetadata(CharacterMetadata metadata) { this.metadata = metadata; }
}
