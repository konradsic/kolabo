CREATE TABLE document_members
(
    id          UUID         NOT NULL PRIMARY KEY ,
    document_id UUID         REFERENCES docs(id),
    user_id     UUID         REFERENCES users(id),
    role        VARCHAR(255) NOT NULL
);

ALTER TABLE docs
    ADD link_access_role TEXT;

ALTER TABLE docs
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE docs
    ALTER COLUMN owner_id SET NOT NULL;