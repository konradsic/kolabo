ALTER TABLE document_members
    ADD CONSTRAINT uq_document_user UNIQUE (document_id, user_id);