package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dto.DocumentContentDto;
import dev.konradsic.kolabo.dto.DocumentDto;
import dev.konradsic.kolabo.dto.OwnerDto;
import dev.konradsic.kolabo.model.Document;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
public class DocumentMapper {
    public static DocumentDto toDto(Document document, boolean owned) {
        return new DocumentDto(
            document.getId(),
            document.getTitle(),
            document.getCreatedAt(),
            document.getLinkAccessRole(),
            new OwnerDto(
                document.getOwner().getId(),
                document.getOwner().getEmail()
            ),
            owned
        );
    }

    public static DocumentContentDto toContentDto(Document document, boolean owned) {
        DocumentDto dto = toDto(document, owned);
        return new DocumentContentDto(
            dto.id(),
            dto.title(),
            dto.createdAt(),
            dto.linkAccessRole(),
            dto.owner()
        );
    }

    public static List<DocumentDto> zipOwnedAndInvited(List<Document> owned, List<Document> invited) {
        Stream<DocumentDto> ownedStream = owned.stream().map(doc -> toDto(doc, true));
        Stream<DocumentDto> invitedStream = invited.stream().map(doc -> toDto(doc, false));
        return Stream.concat(ownedStream, invitedStream).toList();
    }
}
