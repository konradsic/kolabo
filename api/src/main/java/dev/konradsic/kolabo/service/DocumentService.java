package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dao.DocumentDao;
import dev.konradsic.kolabo.dao.DocumentMemberDao;
import dev.konradsic.kolabo.exceptions.ForbiddenException;
import dev.konradsic.kolabo.exceptions.NotFoundException;
import dev.konradsic.kolabo.model.Document;
import dev.konradsic.kolabo.model.DocumentMember;
import dev.konradsic.kolabo.model.LinkAccessRole;
import dev.konradsic.kolabo.model.User;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentDao documentDao;
    private final DocumentMemberDao documentMemberDao;
    private final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    public DocumentService(DocumentDao documentDao, DocumentMemberDao documentMemberDao) {
        this.documentDao = documentDao;
        this.documentMemberDao = documentMemberDao;
    }

    @Transactional
    public Document createDocument(String title, User owner) {
        var doc = new Document();
        doc.setTitle(title);
        doc.setOwner(owner);

        logger.trace("Creating document with title {} owned by {}", title, owner.getEmail());
        return documentDao.save(doc);
    }

    @Transactional
    public Document saveDocument(Document document) {
        logger.trace("Saving document with title and id {} {}", document.getTitle(), document.getId());
        return documentDao.save(document);
    }

    @Transactional
    public void deleteDocumentById(UUID id) throws NotFoundException {
        Document document = documentDao.findById(id).orElse(null);
        if (document == null) {
            throw new NotFoundException("Document with id " + id + " not found");
        }

        logger.warn("Deleting document with id {}", id);
        List<DocumentMember> members = documentMemberDao.findByDocumentId(id);
        documentMemberDao.deleteAll(members);
        documentDao.delete(document);
    }

    public Document getDocumentForUserOrThrow(UUID documentId, UUID userId) throws NotFoundException, ForbiddenException {
        Document document = documentDao.findById(documentId).orElse(null);
        if (document == null) throw new NotFoundException("Document with id " + documentId + " not found");
        List<DocumentMember> members = documentMemberDao.findByDocumentId(document.getId());
        for (DocumentMember member : members) {
            if (member.getUser().getId().equals(userId)) {
                return document;
            }
        }

        if (document.getOwner().getId().equals(userId)
            || (document.getLinkAccessRole() != null &&
                (document.getLinkAccessRole().equals(LinkAccessRole.VIEW)
                || document.getLinkAccessRole().equals(LinkAccessRole.EDIT))
        )) {
            return document;
        }
        throw new ForbiddenException("Can't access document with id '" + documentId + "' - insufficient permissions");
    }

    public List<Document> getOwnedDocuments(User owner) {
        return documentDao.findAllByOwner(owner);
    }

    public Document getDocumentById(UUID id) {
        return documentDao.findById(id).orElse(null);
    }

    public List<Document> getInvitedDocuments(User user) {
        List<DocumentMember> memberships = documentMemberDao.findByUserId(user.getId());
        return memberships.stream().map(DocumentMember::getDocument).toList();
    }
}
