package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dto.DocumentContentDto;
import dev.konradsic.kolabo.dto.DocumentDto;
import dev.konradsic.kolabo.dto.OwnerDto;
import dev.konradsic.kolabo.model.Document;
import org.springframework.stereotype.Service;

@Service
public class DocumentMapper {
    public static DocumentDto toDto(Document document) {
        return new DocumentDto(
            document.getId(),
            document.getTitle(),
            document.getCreatedAt(),
            document.getLinkAccessRole(),
            new OwnerDto(
                document.getOwner().getId(),
                document.getOwner().getEmail()
            )
        );
    }

    public static DocumentContentDto toContentDto(Document document) {
        DocumentDto dto = toDto(document);
        return new DocumentContentDto(
            dto.id(),
            dto.title(),
            dto.createdAt(),
            document.getContent(),
            dto.linkAccessRole(),
            dto.owner()
        );
    }
}
