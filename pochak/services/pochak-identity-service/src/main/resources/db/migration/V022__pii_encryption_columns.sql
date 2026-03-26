-- SEC-008: Widen columns for PII encryption (Base64-encoded ciphertext is ~3x original size)
ALTER TABLE identity.users ALTER COLUMN email TYPE VARCHAR(500);
ALTER TABLE identity.users ALTER COLUMN phone_number TYPE VARCHAR(500);
ALTER TABLE identity.users ALTER COLUMN guardian_phone TYPE VARCHAR(500);

-- Convert birth_date from DATE to VARCHAR for encrypted storage
ALTER TABLE identity.users ALTER COLUMN birth_date TYPE VARCHAR(500) USING birth_date::TEXT;
