\set ON_ERROR_STOP on

-- Executed once on an empty data volume, connected to ${POSTGRES_DB} as ${POSTGRES_USER} (database owner).
-- The database itself is created by the postgres image from POSTGRES_DB / POSTGRES_USER.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users
(
    user_key     SERIAL PRIMARY KEY,
    user_code    UUID                                   NOT NULL DEFAULT gen_random_uuid(),
    username     VARCHAR(255)                           NOT NULL UNIQUE,
    password     VARCHAR(255)                           NOT NULL,
    nick         VARCHAR(255),
    role         VARCHAR(255)                           NOT NULL DEFAULT 'user',
    active       BOOLEAN                                NOT NULL DEFAULT false,
    ban          BOOLEAN                                NOT NULL DEFAULT false,
    created_date TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by   VARCHAR(255) DEFAULT 'system'          NOT NULL,
    updated_date TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by   VARCHAR(255) DEFAULT 'system'          NOT NULL
);

-- Application role with data access only (development password, override outside local use)
CREATE ROLE parkoid_user_app LOGIN PASSWORD 'parkoid_user_pwd';

GRANT USAGE ON SCHEMA public TO parkoid_user_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO parkoid_user_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO parkoid_user_app;

-- Tables created later by the owner are accessible to the app role as well
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO parkoid_user_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO parkoid_user_app;

