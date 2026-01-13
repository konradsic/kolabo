package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dao.DocumentMemberDao;
import dev.konradsic.kolabo.exceptions.NotFoundException;
import dev.konradsic.kolabo.model.Document;
import dev.konradsic.kolabo.model.DocumentMember;
import dev.konradsic.kolabo.model.LinkAccessRole;
import dev.konradsic.kolabo.model.User;
import jakarta.transaction.Transactional;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


@Service
public class DocumentMemberService {

    private final DocumentMemberDao documentMemberDao;
    private final Logger logger = LoggerFactory.getLogger(DocumentMemberService.class);

    public DocumentMemberService(DocumentMemberDao documentMemberDao) {
        this.documentMemberDao = documentMemberDao;
    }

    @Transactional
    public void addMemberToDocument(Document doc, User user, LinkAccessRole role) {
        DocumentMember documentMember = new DocumentMember();
        documentMember.setUser(user);
        documentMember.setDocument(doc);
        documentMember.setRole(role);

        logger.info("Adding user {} as member to document {} with role {}", user.getEmail(), doc.getTitle(), role);;

        try {
            documentMemberDao.save(documentMember);
            documentMemberDao.flush();
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("User " + user.getEmail() + " is already a member of document " + doc.getTitle());
        }
    }

    @Transactional
    public void updateMemberRoleInDocument(DocumentMember documentMember, LinkAccessRole role) {
        logger.info("Updating role of user {} in document {} to {}", documentMember.getUser().getEmail(), documentMember.getDocument().getTitle(), role);
        documentMember.setRole(role);
        documentMemberDao.save(documentMember);
    }

    @Transactional
    public void removeMemberFromDocument(Document doc, User user) {
        DocumentMember documentMember = documentMemberDao.findByDocumentIdAndUserId(doc.getId(), user.getId()).orElse(null);
        if (documentMember != null) {
            logger.info("Removing user {} from document {}", user.getEmail(), doc.getTitle());
            documentMemberDao.delete(documentMember);
        } else {
            logger.warn("User {} is not a member of document {}", user.getEmail(), doc.getTitle());
            throw new NotFoundException("User " + user.getEmail() + " is not a member of document " + doc.getTitle());
        }
    }

}
