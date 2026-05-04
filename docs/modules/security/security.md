# Security Module

Library-style Nest module: **no HTTP controller**. Provides **symmetric envelope encryption** for application secrets and **bcrypt** helpers for password hashing.

---

## Service

- Name: `SecurityService`
- Description: Encrypt and decrypt `SecretRecordModel` payloads with AES-256-GCM and a master-derived key (Argon2id); hash and verify passwords with bcrypt

### Cryptography (encrypt / decrypt)

**Envelope layout**

1. Generate a random **data key** (32 bytes).
2. Encrypt the plaintext **secret** with AES-256-GCM using the data key → inner `ciphertext`, `iv_secret`, `tag_secret`.
3. Generate a random **salt** (16 bytes); derive a **master key** from `ENCRYPTION_MASTER_PASSWORD` + salt with **Argon2id** (`raw: true`, `hashLength: 32`, `timeCost: 3`, `memoryCost: 64 * 1024`, `parallelism: 4`).
4. Encrypt the data key (as base64 string) with AES-256-GCM using the master key → `encrypted_data_key`, `iv_data_key`, `tag_data_key`.
5. Persist all base64-encoded fields plus `salt` in a `SecretRecordModel`.

**Decrypt** reverses the steps: derive master key from `salt`, decrypt data key, decrypt inner ciphertext to the original string.

All AES-GCM operations use a random **12-byte IV** per operation (`randBytes(12)`).

### Methods

- encrypt
  - Description: Turn a cleartext string into a storable `SecretRecordModel` (envelope encryption)
  - Parameters:
    - secret: string
  - Logic:
    - Derive keys and run AES-GCM as above; log debug on success path
    - On any throw: log error, return `err(DecryptionError)` with message `"Encryption failed"` (error type name matches current implementation)
  - Returns: `Promise<Result<SecretRecordModel, DecryptionError>>`

- decrypt
  - Description: Restore cleartext from a `SecretRecordModel`
  - Parameters:
    - record: `SecretRecordModel` (base64 fields as stored)
  - Logic:
    - Decode buffers, derive master key, unwrap data key, decrypt secret
    - On failure (wrong password, corrupt blob, tag mismatch): log debug, return `err(DecryptionError)` with `"Decryption failed"`
  - Returns: `Promise<Result<string, DecryptionError>>`

- hash
  - Description: One-way bcrypt hash for passwords (not reversible; unrelated to AES envelope)
  - Parameters:
    - password: string
  - Logic:
    - `bcrypt.hash(password, 10)` (cost factor 10)
    - On throw: log error, return `err(HashError)` with `"Hash failed"`
  - Returns: `Promise<Result<string, HashError>>`

- compareHash
  - Description: Constant-time-friendly compare of plaintext password to stored bcrypt hash
  - Parameters:
    - password: string
    - hashedPassword: string
  - Logic:
    - `bcrypt.compare(password, hashedPassword)`; on throw return `err(HashError)` with `"Hash comparison failed"`
  - Returns: `Promise<Result<boolean, HashError>>`
