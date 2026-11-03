# Implementation Reference: Object Storage & File Adapters

Reference implementations for S3, Cloudflare R2, Supabase Storage, and In-Memory testing fake under the Wrapper + Adapter architecture.

---

## 1. AWS S3 Adapter (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)

```ts
// src/infrastructure/adapters/storage/s3-storage.adapter.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StoragePort, PutFileInput, PutFileOutput, StorageFile, PresignedUrlInput } from "@/domains/storage/storage.port";
import { AppError } from "@/errors/app-error";

export class S3StorageAdapter implements StoragePort {
  constructor(private client: S3Client, private publicBaseUrl?: string) {}

  async putFile(input: PutFileInput): Promise<PutFileOutput> {
    try {
      const res = await this.client.send(
        new PutObjectCommand({
          Bucket: input.bucket,
          Key: input.key,
          Body: input.file.buffer,
          ContentType: input.file.contentType,
        })
      );
      const publicUrl = this.publicBaseUrl ? `${this.publicBaseUrl.replace(/\/$/, "")}/${input.key}` : undefined;
      return { key: input.key, bucket: input.bucket, publicUrl, etag: res.ETag };
    } catch (err) {
      throw new AppError({ message: "Error al subir archivo a S3.", statusCode: 502, cause: err });
    }
  }

  async getFile(bucket: string, key: string): Promise<StorageFile> {
    const res = await this.client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) {
      throw new AppError({ message: "Archivo no encontrado o vacío.", statusCode: 404 });
    }
    return { buffer: bytes, contentType: res.ContentType ?? "application/octet-stream", sizeBytes: res.ContentLength ?? bytes.byteLength };
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async createPresignedUrl(input: PresignedUrlInput): Promise<string> {
    const Command = input.operation === "getObject" ? GetObjectCommand : PutObjectCommand;
    return getSignedUrl(this.client, new Command({ Bucket: input.bucket, Key: input.key }), { expiresIn: input.expiresInSeconds });
  }
}
```

---

## 2. Cloudflare R2 Adapter (S3-Compatible)

```ts
// src/infrastructure/adapters/storage/r2-storage.adapter.ts
import { S3Client } from "@aws-sdk/client-s3";
import { S3StorageAdapter } from "./s3-storage.adapter";

export function createR2StorageAdapter(accountId: string, accessKeyId: string, secretAccessKey: string, publicUrl?: string) {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return new S3StorageAdapter(client, publicUrl);
}
```

---

## 3. Supabase Storage Adapter (`@supabase/storage-js`)

```ts
// src/infrastructure/adapters/storage/supabase-storage.adapter.ts
import type { StorageClient } from "@supabase/storage-js";
import type { StoragePort, PutFileInput, PutFileOutput, StorageFile, PresignedUrlInput } from "@/domains/storage/storage.port";
import { AppError } from "@/errors/app-error";

export class SupabaseStorageAdapter implements StoragePort {
  constructor(private client: StorageClient) {}

  async putFile(input: PutFileInput): Promise<PutFileOutput> {
    const { data, error } = await this.client.from(input.bucket).upload(input.key, input.file.buffer, {
      contentType: input.file.contentType,
      upsert: true,
    });
    if (error || !data) {
      throw new AppError({ message: "Error al almacenar archivo en Supabase.", statusCode: 502, cause: error });
    }
    const publicUrl = input.isPublic ? this.client.from(input.bucket).getPublicUrl(input.key).data.publicUrl : undefined;
    return { key: input.key, bucket: input.bucket, publicUrl };
  }

  async getFile(bucket: string, key: string): Promise<StorageFile> {
    const { data, error } = await this.client.from(bucket).download(key);
    if (error || !data) {
      throw new AppError({ message: "Archivo no encontrado.", statusCode: 404, cause: error });
    }
    const buffer = new Uint8Array(await data.arrayBuffer());
    return { buffer, contentType: data.type || "application/octet-stream", sizeBytes: buffer.byteLength };
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const { error } = await this.client.from(bucket).remove([key]);
    if (error) {
      throw new AppError({ message: "Error al eliminar archivo en Supabase.", statusCode: 502, cause: error });
    }
  }

  async createPresignedUrl(input: PresignedUrlInput): Promise<string> {
    if (input.operation !== "getObject") {
      throw new AppError({ message: "Operación de presigned URL no soportada.", statusCode: 400 });
    }
    const { data, error } = await this.client.from(input.bucket).createSignedUrl(input.key, input.expiresInSeconds);
    if (error || !data?.signedUrl) {
      throw new AppError({ message: "No se pudo generar URL firmada.", statusCode: 502, cause: error });
    }
    return data.signedUrl;
  }
}
```

---

## 4. In-Memory Storage Adapter (Testing Fake)

```ts
// src/infrastructure/adapters/storage/memory-storage.adapter.ts
import type { StoragePort, PutFileInput, PutFileOutput, StorageFile, PresignedUrlInput } from "@/domains/storage/storage.port";
import { AppError } from "@/errors/app-error";

export class MemoryStorageAdapter implements StoragePort {
  private files = new Map<string, StorageFile>();

  private keyOf(bucket: string, key: string): string {
    return `${bucket}:${key}`;
  }

  async putFile(input: PutFileInput): Promise<PutFileOutput> {
    this.files.set(this.keyOf(input.bucket, input.key), input.file);
    return { key: input.key, bucket: input.bucket, publicUrl: `https://mock.storage/${input.key}` };
  }

  async getFile(bucket: string, key: string): Promise<StorageFile> {
    const file = this.files.get(this.keyOf(bucket, key));
    if (!file) throw new AppError({ message: "Archivo inexistente en memoria.", statusCode: 404 });
    return file;
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    this.files.delete(this.keyOf(bucket, key));
  }

  async createPresignedUrl(input: PresignedUrlInput): Promise<string> {
    return `https://mock.storage/presigned/${input.bucket}/${input.key}?expires=${input.expiresInSeconds}`;
  }
}
```
