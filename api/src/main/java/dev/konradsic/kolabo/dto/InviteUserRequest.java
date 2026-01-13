package dev.konradsic.kolabo.dto;

import dev.konradsic.kolabo.model.LinkAccessRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InviteUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private LinkAccessRole role;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LinkAccessRole getRole() {
        return role;
    }

    public void setRole(LinkAccessRole role) {
        this.role = role;
    }
}
