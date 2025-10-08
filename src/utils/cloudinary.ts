// Cloudinary configuration and upload utilities
import { CLOUDINARY_CONFIG } from '@/config/cloudinary'

export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file))
    const results = await Promise.all(uploadPromises)
    return results.map(result => result.secure_url)
  } catch (error) {
    console.error('Multiple upload error:', error)
    throw new Error('Failed to upload images to Cloudinary')
  }
}
