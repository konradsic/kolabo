package dev.konradsic.kolabo.ws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.konradsic.kolabo.crdt.op.CrdtOp;
import dev.konradsic.kolabo.service.CrdtPersistenceService;
import dev.konradsic.kolabo.service.DocumentService;
import jakarta.servlet.http.HttpSession;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DocumentWSComponent extends TextWebSocketHandler {

    private final Map<UUID, Set<WebSocketSession>> docSessions = new ConcurrentHashMap<>();
    private final Map<UUID, Map<UUID, WebSocketSession>> docUsers = new ConcurrentHashMap<>();
    private final CrdtPersistenceService crdtPersistenceService;
    private final Logger logger = LoggerFactory.getLogger(DocumentWSComponent.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final DocumentService documentService;

    public DocumentWSComponent(CrdtPersistenceService crdtPersistenceService, DocumentService documentService) {
        this.crdtPersistenceService = crdtPersistenceService;
        this.documentService = documentService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        HttpSession httpSession = (HttpSession) session.getAttributes().get("HTTP_SESSION");
        if (httpSession == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("No HTTP session"));
            return;
        }

        UUID userId = (UUID) httpSession.getAttribute("user");
        if (userId == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("User not logged in"));
            return;
        }
        session.getAttributes().put("userId", userId);
        UUID docId = getDocId(session);

        authorize(userId, docId);

        docUsers.computeIfAbsent(docId, k -> new ConcurrentHashMap<>()).put(userId, session);
        List<UUID> currentUsers = new ArrayList<>(docUsers.get(docId).keySet());
        Map<String, Object> payload = Map.of(
            "type", "currentUsers",
            "users", currentUsers
        );
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        broadcastUserEvent(docId, userId, "join");

        docSessions.computeIfAbsent(docId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        UUID userId = (UUID) session.getAttributes().get("userId");
        UUID docId = getDocId(session);

        CrdtOp crdtOp = objectMapper.readValue(message.getPayload(), CrdtOp.class);
        crdtPersistenceService.saveOp(docId, crdtOp);
        logger.info("Saved CrdtOp for doc {} by user {}", docId, userId);
        broadcast(docId, session, message);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, @NonNull CloseStatus status) {
        docSessions.values().forEach(s -> s.remove(session));
        UUID userId = (UUID) session.getAttributes().get("userId");
        UUID docId = getDocId(session);
        Map<UUID, WebSocketSession> users = docUsers.get(docId);
        if (users != null) {
            users.remove(userId);
            broadcastUserEvent(docId, userId, "leave");
        }
    }

    // --- helpers ---

    private void broadcast(UUID docId, WebSocketSession sender, TextMessage msg) {
        docSessions.getOrDefault(docId, Set.of()).forEach(s -> {
            if (s.isOpen() && s != sender) {
                try {
                    s.sendMessage(msg);
                } catch (Exception ignored) {
                    logger.error("Failed to send message to session {}", s.getId(), ignored);
                }
            }
        });
    }

    private void broadcastUserEvent(UUID docId, UUID userId, String action) {
        Map<UUID, WebSocketSession> users = docUsers.get(docId);
        if (users == null) return;

        Map<String, Object> payload = Map.of(
            "type", "userEvent",
            "action", action, // "join" or "leave"
            "userId", userId
        );

        String msg;
        try {
            msg = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        users.values().forEach(session -> {
            try {
                if (session.isOpen() && session.getAttributes().get("userId") != userId) session.sendMessage(new TextMessage(msg));
            } catch (Exception ignored) {}
        });
    }


    private UUID getDocId(WebSocketSession session) {
        String path = Objects.requireNonNull(session.getUri()).getPath();
        return UUID.fromString(path.substring(path.lastIndexOf("/") + 1));
    }

    private void authorize(UUID userId, UUID docId) {
        documentService.getDocumentForUserOrThrow(docId, userId);
    }

}
