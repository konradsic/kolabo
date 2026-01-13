package dev.konradsic.kolabo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.konradsic.kolabo.crdt.CRDTInstance;
import dev.konradsic.kolabo.crdt.Character;
import dev.konradsic.kolabo.crdt.op.CrdtOp;
import dev.konradsic.kolabo.crdt.op.DeleteOp;
import dev.konradsic.kolabo.crdt.op.InsertOp;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class CrdtOpService {

    private final Map<UUID, CRDTInstance> docCache = new ConcurrentHashMap<>();
    private final RedisTemplate<String, String> redis;
    private final CrdtPersistenceService persistenceService;

    public CrdtOpService(RedisTemplate<String, String> redis, CrdtPersistenceService persistenceService) {
        this.redis = redis;
        this.persistenceService = persistenceService;
    }

    public void process(UUID docId, CrdtOp op) {
        CRDTInstance crdt = docCache.computeIfAbsent(docId, id -> loadOrCreate(id));

        if (op instanceof InsertOp insertOp) {
            crdt.insert(insertOp.value(), null, null);
        } else if (op instanceof DeleteOp deleteOp) {
            Character c = crdt.getCharacters().get(deleteOp.charId());
            if (c != null) c.getMetadata().setDeleted(true);
        }
        persistenceService.saveOp(docId, op);
        saveSnapshotToRedis(docId, crdt);
    }

    private CRDTInstance loadOrCreate(UUID docId) {
        String snapshotJson = redis.opsForValue().get("doc:" + docId + ":snapshot");
        if (snapshotJson != null) {
            return persistenceService.deserialize(snapshotJson);
        }
        return new CRDTInstance(32.0, docId.toString());
    }

    private void saveSnapshotToRedis(UUID docId, CRDTInstance crdt) {
        String json = persistenceService.serialize(crdt);
        redis.opsForValue().set("doc:" + docId + ":snapshot", json);
    }

    public CRDTInstance getSnapshot(UUID docId) {
        return docCache.computeIfAbsent(docId, this::loadOrCreate);
    }
}
