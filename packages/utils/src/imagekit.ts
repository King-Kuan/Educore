import ImageKit from "imagekit";

// ─── CLIENT ───────────────────────────────────────────────────────────────

function getImageKitServer(): ImageKit {
  return new ImageKit({
    publicKey:  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });
}

// ─── AUTH PARAMS (for client-side upload) ─────────────────────────────────

/**
 * Generate auth parameters for client-side ImageKit upload.
 * Call from a server API route — never expose privateKey to client.
 */
export async function getImageKitAuthParams(): Promise<{
  token:   string;
  expire:  number;
  signature: string;
}> {
  const ik = getImageKitServer();
  return ik.getAuthenticationParameters();
}

// ─── SERVER-SIDE UPLOAD ───────────────────────────────────────────────────

/**
 * Upload a student photo from server (base64 or URL).
 * Returns the ImageKit file URL.
 */
export async function uploadStudentPhoto(
  base64: string,
  studentCode: string,
  schoolId: string
): Promise<{ url: string; fileId: string }> {
  const ik = getImageKitServer();

  const result = await ik.upload({
    file:     base64,
    fileName: `student_${studentCode}.jpg`,
    folder:   `/educore/schools/${schoolId}/students`,
    tags:     ["student", "photo", schoolId],
    transformation: {
      pre: "w-300,h-360,fo-face,c-maintain_ratio",
    },
  });

  return { url: result.url, fileId: result.fileId };
}

/**
 * Upload a school logo.
 */
export async function uploadSchoolLogo(
  base64: string,
  schoolId: string
): Promise<{ url: string; fileId: string }> {
  const ik = getImageKitServer();

  const result = await ik.upload({
    file:     base64,
    fileName: `logo_${schoolId}.png`,
    folder:   `/educore/schools/${schoolId}`,
    tags:     ["logo", schoolId],
  });

  return { url: result.url, fileId: result.fileId };
}

/**
 * Delete an image from ImageKit by fileId.
 */
export async function deleteImage(fileId: string): Promise<void> {
  const ik = getImageKitServer();
  await ik.deleteFile(fileId);
}

// ─── URL TRANSFORMS ───────────────────────────────────────────────────────

/**
 * Get a transformed ImageKit URL.
 * Useful for generating thumbnails from stored URLs.
 */
export function getImageKitUrl(
  path: string,
  transforms?: { width?: number; height?: number; quality?: number }
): string {
  const base = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  const t    = transforms ?? {};
  const params: string[] = [];

  if (t.width)   params.push(`w-${t.width}`);
  if (t.height)  params.push(`h-${t.height}`);
  if (t.quality) params.push(`q-${t.quality}`);

  if (params.length === 0) return `${base}/${path}`;
  return `${base}/tr:${params.join(",")}/${path}`;
}
