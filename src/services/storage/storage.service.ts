import { put } from '@vercel/blob';

export async function uploadFile(file: File | Blob, userId: string): Promise<string | null> {
  try {
    const fileName = (file as File).name || 'photo.png';
    const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'png';
    const path = `user-photos/${userId}/user-photo.${fileExt}`;

    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return blob.url;
  } catch (error) {
    console.error("Erro no upload direto para Vercel Blob:", error);
    return null;
  }
}