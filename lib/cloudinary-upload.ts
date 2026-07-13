export async function uploadToCloudinary(file: File, maxSizeKB: number = 200): Promise<string> {
  const maxSizeBytes = maxSizeKB * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeKB}KB. Current size: ${(file.size / 1024).toFixed(2)}KB`);
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/distributors/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to upload file');
  }

  if (!data?.url) {
    throw new Error('Upload completed without a file URL');
  }

  return data.url;
}
