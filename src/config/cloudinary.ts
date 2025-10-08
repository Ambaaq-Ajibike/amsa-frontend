// Cloudinary configuration
// Replace these with your actual Cloudinary credentials
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
}

// Instructions for setup:
// 1. Create a Cloudinary account at https://cloudinary.com
// 2. Get your cloud name from the dashboard
// 3. Create an unsigned upload preset:
//    - Go to Settings > Upload
//    - Add upload preset
//    - Set signing mode to "Unsigned"
//    - Set folder (optional)
//    - Save the preset name
// 4. Add these environment variables to your .env file:
//    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//    VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
//    VITE_CLOUDINARY_API_KEY=your_api_key
