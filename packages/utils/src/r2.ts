import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── R2 CLIENT ────────────────────────────────────────────────────────────

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const BUCKET = () => process.env.R2_BUCKET_NAME!;

// ─── UPLOAD ───────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to R2.
 * Key format: "schools/{schoolId}/files/{term}/{filename}"
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  mimeType: string,
  metadata?: Record<string, string>
): Promise<{ key: string; url: string }> {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket:      BUCKET(),
      Key:         key,
      Body:        body,
      ContentType: mimeType,
      Metadata:    metadata,
    })
  );

  return { key, url: `${process.env.R2_PUBLIC_URL}/${key}` };
}

// ─── GET SIGNED URL ───────────────────────────────────────────────────────

/**
 * Generate a pre-signed download URL (valid for 1 hour by default).
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({ Bucket: BUCKET(), Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed upload URL (for client-side uploads).
 */
export async function getSignedUploadUrl(
  key: string,
  mimeType: string,
  expiresInSeconds = 300
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket:      BUCKET(),
    Key:         key,
    ContentType: mimeType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

// ─── DELETE ───────────────────────────────────────────────────────────────

/**
 * Delete a file from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: BUCKET(), Key: key })
  );
}

// ─── KEY GENERATORS ───────────────────────────────────────────────────────

/**
 * Generate a consistent R2 key for teacher file uploads.
 * Pattern: schools/{schoolId}/files/{academicYear}/{term}/{folderId}/{filename}
 */
export function generateFileKey(
  schoolId:     string,
  academicYear: string,
  term:         number,
  folderId:     string,
  fileName:     string
): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ts = Date.now();
  return `schools/${schoolId}/files/${academicYear}/term${term}/${folderId}/${ts}_${sanitized}`;
}

/**
 * Generate R2 key for report PDFs (generated on demand, not stored).
 * Used only for bulk export downloads.
 */
export function generateReportKey(
  schoolId:   string,
  classId:    string,
  term:       number,
  studentId:  string
): string {
  return `schools/${schoolId}/reports/${classId}/term${term}/${studentId}.pdf`;
}

// ─── FILE EXPIRY ──────────────────────────────────────────────────────────

/**
 * Calculate file expiry date: exactly 4 months from upload.
 */
export function calculateFileExpiry(uploadedAt: Date): Date {
  const expiry = new Date(uploadedAt);
  expiry.setMonth(expiry.getMonth() + 4);
  return expiry;
}

/**
 * Check if a file has expired.
 */
export function isFileExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
