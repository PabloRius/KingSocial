"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          }
        }
      )
      .end(buffer);
  });
}

function getCloudinaryPublicId(url: string) {
  const fileWithExt = url.split("/").at(-1);
  console.log(url);
  const publicId = fileWithExt?.split(".")[0];
  return publicId;
}

export async function deleteFromCloudinary(url: string, folder?: string) {
  const publicId = getCloudinaryPublicId(url);
  try {
    await cloudinary.uploader.destroy(folder + "/" + publicId);
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
  }
}
