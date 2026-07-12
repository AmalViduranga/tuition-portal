/**
 * Safely extracts the storage object path from a potentially malformed or full Supabase URL.
 * Ensures the bucket name isn't duplicated and handles various URL structures.
 * 
 * @param fileUrl The raw value from the database (e.g. 'https://.../storage/v1/object/public/materials/filename.pdf')
 * @param bucketName The name of the Supabase bucket (e.g. 'materials')
 * @returns The pure object path within the bucket (e.g. 'materials/filename.pdf' or 'filename.pdf')
 */
export function extractStoragePath(fileUrl: string, bucketName: string): string {
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('Invalid file URL provided');
  }

  // If it doesn't look like a URL (e.g., already just a path or filename)
  if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    // If it's something dangerous like javascript: or data:, reject it.
    if (fileUrl.includes(':')) {
      throw new Error('Unsupported protocol or malformed URL');
    }
    // If it's already a clean path starting with the bucket name or just a file name
    return fileUrl;
  }

  try {
    const urlObj = new URL(fileUrl);
    const pathname = urlObj.pathname; // e.g. /storage/v1/object/public/materials/folder/file.pdf

    // Extract everything after `/public/${bucketName}/`
    const publicPrefix = `/public/${bucketName}/`;
    const publicIndex = pathname.indexOf(publicPrefix);

    if (publicIndex !== -1) {
      return pathname.substring(publicIndex + publicPrefix.length);
    }

    // Fallback: If it's a signed URL or different route, look for `/sign/${bucketName}/`
    const signPrefix = `/sign/${bucketName}/`;
    const signIndex = pathname.indexOf(signPrefix);
    
    if (signIndex !== -1) {
      return pathname.substring(signIndex + signPrefix.length);
    }
    
    // Fallback: Just return the original if we can't safely parse it to a path,
    // though this might fail downstream if used directly in createSignedUrl.
    return fileUrl;

  } catch {
    throw new Error('Malformed URL provided');
  }
}
