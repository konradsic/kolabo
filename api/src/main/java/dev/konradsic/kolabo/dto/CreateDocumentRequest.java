package dev.konradsic.kolabo.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateDocumentRequest {

    @NotBlank(message = "Document title cannot be blank")
    private String title;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
