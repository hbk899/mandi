import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

export function getCloudinaryTransformUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
) {
  return cloudinary.url(publicId, {
    width: options.width ?? 800,
    height: options.height ?? 600,
    crop: options.crop ?? 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  })
}
