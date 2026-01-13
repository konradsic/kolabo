package dev.konradsic.kolabo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "docs")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_access_role", columnDefinition = "TEXT")
    private LinkAccessRole linkAccessRole;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public User getOwner() { return owner; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LinkAccessRole getLinkAccessRole() { return linkAccessRole; }

    public void setTitle(String title) { this.title = title; }
    public void setOwner(User owner) { this.owner = owner; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setLinkAccessRole(LinkAccessRole linkAccessRole) { this.linkAccessRole = linkAccessRole; }
}
