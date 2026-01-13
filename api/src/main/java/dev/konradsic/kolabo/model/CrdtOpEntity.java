package dev.konradsic.kolabo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crdt_ops")
public class CrdtOpEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Document document;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String opJson;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public UUID getId() { return id; }
    public Document getDocument() { return document; }
    public String getOpJson() { return opJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setDocument(Document document) { this.document = document; }
    public void setOpJson(String opJson) { this.opJson = opJson; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
