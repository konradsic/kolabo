package dev.konradsic.kolabo.crdt;

public class CharacterMetadata {
    private boolean isDeleted;

    public CharacterMetadata() {
        this.isDeleted = false;
    }

    public boolean isDeleted() { return isDeleted; }

    public void setDeleted(boolean deleted) { isDeleted = deleted; }
}
