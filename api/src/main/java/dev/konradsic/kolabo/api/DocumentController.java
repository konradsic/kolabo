package dev.konradsic.kolabo.api;

import dev.konradsic.kolabo.dao.DocumentMemberDao;
import dev.konradsic.kolabo.dto.ApiResponse;
import dev.konradsic.kolabo.dto.CreateDocumentRequest;
import dev.konradsic.kolabo.dto.DocumentContentDto;
import dev.konradsic.kolabo.dto.InviteUserRequest;
import dev.konradsic.kolabo.exceptions.NotFoundException;
import dev.konradsic.kolabo.exceptions.UnauthorizedException;
import dev.konradsic.kolabo.model.Document;
import dev.konradsic.kolabo.model.DocumentMember;
import dev.konradsic.kolabo.model.LinkAccessRole;
import dev.konradsic.kolabo.model.User;
import dev.konradsic.kolabo.service.DocumentMapper;
import dev.konradsic.kolabo.service.DocumentMemberService;
import dev.konradsic.kolabo.service.DocumentService;
import dev.konradsic.kolabo.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final UserService userService;
    private final DocumentService documentService;
    private final DocumentMemberService documentMemberService;
    private final DocumentMemberDao documentMemberDao;

    public DocumentController(UserService userService, DocumentService documentService, DocumentMemberService documentMemberService, DocumentMemberDao documentMemberDao) {
        this.userService = userService;
        this.documentService = documentService;
        this.documentMemberService = documentMemberService;
        this.documentMemberDao = documentMemberDao;
    }

    @PostMapping
    public ApiResponse<Object> createDocument(@Valid @RequestBody CreateDocumentRequest body, HttpSession session) {
        UUID userId = (UUID) session.getAttribute("user");
        if (userId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        User user = userService.findById(userId);
        Document doc = documentService.createDocument(body.getTitle(), user);

        return new ApiResponse<>(true, Map.of(
            "message", "Document created successfully",
            "title", body.getTitle(),
            "documentId", doc.getId()
        ));
    }

    @GetMapping("/owned")
    public ApiResponse<Object> getOwnedDocuments(HttpSession session) {
        UUID userId = (UUID) session.getAttribute("user");
        if (userId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        User user = userService.findById(userId);
        var documents = documentService.getOwnedDocuments(user).stream().map(DocumentMapper::toDto).toList();

        return new ApiResponse<>(true, Map.of("documents", documents));
    }

    @GetMapping("/{id}")
    public ApiResponse<DocumentContentDto> getById(@PathVariable UUID id, HttpSession session) {
        UUID userId = (UUID) session.getAttribute("user");
        return new ApiResponse<>(true, DocumentMapper.toContentDto(
            documentService.getDocumentForUserOrThrow(id, userId)
        ));
    }

    @GetMapping("/{id}/invites")
    public ApiResponse<Object> getDocumentInvites(@PathVariable("id") UUID documentId, HttpSession session) {
        UUID userId = (UUID) session.getAttribute("user");
        if (userId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        List<DocumentMember> memberList = documentMemberDao.findByDocumentId(documentId);
        Document document = documentService.getDocumentForUserOrThrow(documentId, userId); // check if the user can view
        var invites = memberList.stream().map(dm -> Map.of(
            "userId", dm.getUser().getId(),
            "email", dm.getUser().getEmail(),
            "role", dm.getRole()
        )).toList();

        return new ApiResponse<>(true, Map.of(
            "documentTitle", document.getTitle(),
            "invites", invites
        ));
    }

    @PostMapping("/{id}/invite")
    public ApiResponse<Object> inviteUserToDocument(
        @PathVariable("id") UUID documentId,
        @Valid @RequestBody InviteUserRequest body,
        HttpSession session
    ) {
        UUID ownerId = (UUID) session.getAttribute("user");
        if (ownerId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        User user = userService.findByEmail(body.getEmail());
        if (user == null) {
            throw new NotFoundException("User with email " + body.getEmail() + " not found");
        }
        Document document = documentService.getDocumentForUserOrThrow(documentId, ownerId);
        
        // Ensure the requester is the owner
        if (!document.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You're not the owner of this document");
        }
        
        documentMemberService.addMemberToDocument(document, user, body.getRole());
        List<DocumentMember> currentMembers = documentMemberDao.findByDocumentId(documentId);
        var dtoCurrentMembers = currentMembers.stream().map(dm -> Map.of(
            "userId", dm.getUser().getId(),
            "email", dm.getUser().getEmail(),
            "role", dm.getRole()
        )).toList();
        return new ApiResponse<>(true, Map.of("message", "User invited to document successfully", "currentMembers", dtoCurrentMembers));
    }

    @PutMapping("/{id}/invite/{userId}/{role}")
    public ApiResponse<Object> updateMemberRole(
            @PathVariable("id") UUID documentId,
            @PathVariable UUID userId,
            @PathVariable LinkAccessRole role,
            HttpSession session
    ) {
        UUID loggedInUserId = (UUID) session.getAttribute("user");
        if (loggedInUserId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        Document document = documentService.getDocumentById(documentId);
        if (document == null) {
            throw new NotFoundException("Document not found");
        }
        if (!document.getOwner().getId().equals(loggedInUserId)) {
            throw new UnauthorizedException("You're not the owner of this document");
        }

        DocumentMember member = documentMemberDao.findByDocumentIdAndUserId(documentId, userId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this document"));

        documentMemberService.updateMemberRoleInDocument(member, role);
        return new ApiResponse<>(true, Map.of("message", "Member role updated successfully"));
    }

    @DeleteMapping("/{id}/invite/{userId}")
    public ApiResponse<Object> removeMember(
            @PathVariable("id") UUID documentId,
            @PathVariable UUID userId,
            HttpSession session
    ) {
        UUID loggedInUserId = (UUID) session.getAttribute("user");
        if (loggedInUserId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        Document document = documentService.getDocumentById(documentId);
        if (document == null) {
            throw new NotFoundException("Document not found");
        }
        if (!document.getOwner().getId().equals(loggedInUserId)) {
            throw new UnauthorizedException("You're not the owner of this document");
        }

        User user = userService.findById(userId);
        documentMemberService.removeMemberFromDocument(document, user);
        return new ApiResponse<>(true, Map.of("message", "User removed from document successfully"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteDocument(@PathVariable("id") UUID documentId, HttpSession session) {
        UUID loggedInUserId = (UUID) session.getAttribute("user");
        if (loggedInUserId == null) {
            throw new UnauthorizedException("User not logged in");
        }
        Document document = documentService.getDocumentById(documentId);
        if (document == null) {
            throw new NotFoundException("Document not found");
        }
        if (!document.getOwner().getId().equals(loggedInUserId)) {
            throw new UnauthorizedException("You're not the owner of this document");
        }

        documentService.deleteDocumentById(documentId);
        return new ApiResponse<>(true, Map.of("message", "Document deleted successfully"));
    }
}
