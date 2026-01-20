package dev.konradsic.kolabo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.konradsic.kolabo.crdt.CRDTInstance;
import dev.konradsic.kolabo.dto.ws.CrdtOp;
import dev.konradsic.kolabo.dao.CrdtOpDao;
import dev.konradsic.kolabo.model.CrdtOpEntity;
import dev.konradsic.kolabo.model.Document;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CrdtPersistenceService {

    private final CrdtOpDao crdtOpDao;
    private final DocumentService documentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CrdtPersistenceService(CrdtOpDao crdtOpDao, DocumentService documentService) {
        this.crdtOpDao = crdtOpDao;
        this.documentService = documentService;
    }

    public String serialize(CRDTInstance crdt) {
        try {
            return objectMapper.writeValueAsString(crdt);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize CRDT", e);
        }
    }

    public String serialize(CrdtOp crdtOp) {
        try {
            return objectMapper.writeValueAsString(crdtOp);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize CrdtOp", e);
        }
    }

    public CRDTInstance deserialize(String json) {
        try {
            return objectMapper.readValue(json, CRDTInstance.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize CRDT", e);
        }
    }

    public CrdtOp deserialize(CrdtOpEntity entity) {
        try {
            return objectMapper.readValue(entity.getOpJson(), CrdtOp.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize CrdtOp", e);
        }
    }

    @Async
    public void saveOp(UUID docId, CrdtOp crdtOp) {
        CrdtOpEntity entity = new CrdtOpEntity();
        Document doc = documentService.getDocumentById(docId);
        entity.setDocument(doc);
        entity.setOpJson(serialize(crdtOp));
        entity.setCreatedAt(LocalDateTime.now());
        crdtOpDao.save(entity);
    }

    public List<CrdtOp> getOpsForDocument(UUID docId) {
        List<CrdtOpEntity> entities = crdtOpDao.findAllByDocumentIdOrderByCreatedAtAsc(docId);
        return entities.stream()
                .map(this::deserialize)
                .toList();
    }
}
