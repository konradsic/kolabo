package dev.konradsic.kolabo.model;

import jakarta.persistence.*;
import org.springframework.data.redis.core.RedisHash;

import java.util.UUID;

@Entity
@Table(
    name = "document_members",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"document_id", "user_id"})}
)
public class DocumentMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private LinkAccessRole role;

    public UUID getId() { return id; }
    public Document getDocument() { return document; }
    public User getUser() { return user; }
    public LinkAccessRole getRole() { return role; }

    public void setDocument(Document document) { this.document = document; }
    public void setUser(User user) { this.user = user; }
    public void setRole(LinkAccessRole role) { this.role = role; }
}
