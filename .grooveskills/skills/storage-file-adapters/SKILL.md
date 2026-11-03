---
name: storage-file-adapters
description: Standardized wrapper & adapter architecture for object storage, uploads, presigned URLs, and streaming (AWS S3, Cloudflare R2, Supabase Storage, In-Memory). Discards repository abstractions in favor of direct ports and isolated vendor clients. TRIGGER when implementing file uploads, asset storage, cloud buckets, multipart uploads, or presigned download/upload URLs.
---

# Object Storage & File Adapters (Wrappers + Ports)

Opinionated architectural pattern for object storage and file management (AWS S3, Cloudflare R2, Supabase Storage, In-Memory) utilizing the **Wrapper + Adapter** pattern instead of generic repositories.

---

## 1. Core Principles

1. **Storage is an I/O Port, Not a Repository**:
   - Files are blobs with metadata and URLs, not relational entities. We define `StoragePort`, not `FileRepository`.
2. **Standardized Domain Payload**:
   - Operations consume and return pure domain contracts (`PutFileInput`, `PutFileOutput`, `PresignedUrlInput`).
   - Vendor response shapes (S3 `PutObjectCommandOutput`, Supabase `StorageError`) never escape the adapter boundary.
3. **Vendor Wrappers Isolate Credentials & SDK Quirks**:
   - SDK clients, endpoint URLs, region configs, and multipart batching logic remain strictly inside `src/infrastructure/wrappers/storage/`.
4. **Zero-Change Provider Portability**:
   - Switching between AWS S3, Cloudflare R2, Supabase Storage, or an In-Memory mock during local testing requires swapping only the adapter instance.

---

## 2. Directory Layout

```text
src/
├── actions/
│   └── media/
│       └── upload-avatar.action.ts         # Consumes StoragePort (<80 lines)
├── domains/
│   └── storage/
│       ├── storage.port.ts                 # Domain interface contract (<50 lines)
│       └── storage.types.ts                # Pure domain payloads (<50 lines)
└── infrastructure/
    ├── adapters/
    │   └── storage/
    │       ├── s3-storage.adapter.ts       # AWS S3 implementation (<90 lines)
    │       ├── r2-storage.adapter.ts       # Cloudflare R2 implementation (<90 lines)
    │       ├── supabase-storage.adapter.ts # Supabase Storage implementation (<90 lines)
    │       └── memory-storage.adapter.ts   # In-memory testing adapter (<70 lines)
    └── wrappers/
        └── storage/
            ├── s3-client.wrapper.ts        # AWS SDK client wrapper (<70 lines)
            ├── r2-client.wrapper.ts        # Cloudflare S3-compatible client (<70 lines)
            └── supabase-storage.wrapper.ts # Supabase storage client (<60 lines)
```

---

## 3. Implementation Contract (`src/domains/storage/storage.port.ts`)

```ts
export interface StorageFile {
  buffer: Uint8Array | Buffer;
  contentType: string;
  sizeBytes: number;
}

export interface PutFileInput {
  bucket: string;
  key: string;
  file: StorageFile;
  isPublic?: boolean;
}

export interface PutFileOutput {
  key: string;
  bucket: string;
  publicUrl?: string;
  etag?: string;
}

export interface PresignedUrlInput {
  bucket: string;
  key: string;
  operation: "getObject" | "putObject";
  expiresInSeconds: number;
}

export interface StoragePort {
  putFile(input: PutFileInput): Promise<PutFileOutput>;
  getFile(bucket: string, key: string): Promise<StorageFile>;
  deleteFile(bucket: string, key: string): Promise<void>;
  createPresignedUrl(input: PresignedUrlInput): Promise<string>;
}
```

---

## 4. Usage in Business Actions

```ts
import type { StoragePort } from "@/domains/storage/storage.port";
import { AppError } from "@/errors/app-error";

export async function uploadAvatarAction(
  storage: StoragePort,
  userId: string,
  rawFile: Uint8Array,
  mimeType: string
): Promise<{ avatarUrl: string }> {
  if (rawFile.byteLength > 5 * 1024 * 1024) {
    throw new AppError({ message: "La imagen excede el límite de 5 MB.", statusCode: 400 });
  }

  const result = await storage.putFile({
    bucket: "avatars",
    key: `users/${userId}/avatar.webp`,
    file: { buffer: rawFile, contentType: mimeType, sizeBytes: rawFile.byteLength },
    isPublic: true,
  });

  return { avatarUrl: result.publicUrl ?? result.key };
}
```

---

## 5. Detailed Provider Blueprints

For complete production adapters (AWS S3, Cloudflare R2, Supabase Storage, and In-Memory testing fake), consult:
- `references/storage-adapters-examples.md`
