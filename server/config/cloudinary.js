import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const getStorage = (folder, formats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (req, file) => {
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Detect resource type based on file mimetype
      // PDFs, DOCs, PPTs must be 'raw' — not 'image'
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const resourceType = imageTypes.includes(file.mimetype) ? 'image' : 'raw';

      return {
        folder,
        allowed_formats: formats,
        resource_type: resourceType,
      };
    },
  });
};

export const uploadResource = multer({
  storage: getStorage(
    'campus-grievance/resources',
    ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg']
  ),
});

export const uploadStory = multer({
  storage: getStorage(
    'campus-grievance/stories',
    ['jpg', 'jpeg', 'png', 'webp']
  ),
});

export const uploadGrievance = multer({
  storage: getStorage(
    'campus-grievance/attachments',
    ['pdf', 'jpg', 'jpeg', 'png']
  ),
});

export const getCloudinary = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary.v2;
};

export default cloudinary.v2;