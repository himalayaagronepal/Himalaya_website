import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  // don't throw here — allow non-image flows in dev, but log to help devs
  console.warn("Cloudinary env vars are not fully configured. Image upload will fail until set.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageFromBuffer(buffer: Buffer, opts: UploadApiOptions = {}): Promise<UploadApiResponse> {
  // Pin to image uploads: every caller (admin/outlet-admin/distributor) validates
  // image MIME types before calling, so forcing resource_type prevents a non-image
  // payload from being stored as a raw/video asset. Set last so it can't be overridden.
  const uploadOptions: UploadApiOptions = {
    ...opts,
    resource_type: "image",
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
      if (err) return reject(err);
      resolve(res as UploadApiResponse);
    });
    stream.end(buffer);
  });
}

/**
 * Uploads a non-image file (e.g. a PDF notice attachment) to Cloudinary as a
 * `raw` asset, so it is stored and served byte-for-byte and the returned URL
 * downloads/opens the original file directly. Kept separate from
 * `uploadImageFromBuffer` so image flows stay pinned to `resource_type: image`.
 */
export async function uploadRawFromBuffer(buffer: Buffer, opts: UploadApiOptions = {}): Promise<UploadApiResponse> {
  const uploadOptions: UploadApiOptions = {
    ...opts,
    resource_type: "raw",
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
      if (err) return reject(err);
      resolve(res as UploadApiResponse);
    });
    stream.end(buffer);
  });
}

/** Uploads a video to Cloudinary. Kept separate from uploadImageFromBuffer. */
export async function uploadVideoFromBuffer(buffer: Buffer, opts: UploadApiOptions = {}): Promise<UploadApiResponse> {
  const uploadOptions: UploadApiOptions = {
    ...opts,
    resource_type: "video",
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
      if (err) return reject(err);
      resolve(res as UploadApiResponse);
    });
    stream.end(buffer);
  });
}

/**
 * Permanently removes an image from Cloudinary by its public_id.
 * Used so deleting/replacing a stored image also reclaims it from Cloudinary
 * instead of leaving orphaned assets behind. Swallows errors so callers can
 * safely delete DB records even if the asset is already gone.
 */
export async function deleteImageByPublicId(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
  }
}

/** Removes any Cloudinary asset (image or video) by public_id and resource type. */
export async function deleteAssetByPublicId(publicId: string, resourceType: "image" | "video" | "raw" = "image"): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
  }
}

export default cloudinary;