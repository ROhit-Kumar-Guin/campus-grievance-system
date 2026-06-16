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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});


export const uploadGrievance = multer({
  storage: getStorage(
    'campus-grievance/attachments',
    ['pdf', 'jpg', 'jpeg', 'png']
  ),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG and PNG allowed'), false);
    }
  },
});

export const uploadStory = multer({
  storage: getStorage(
    'campus-grievance/stories',
    ['jpg', 'jpeg', 'png', 'webp']
  ),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed for stories'), false);
    }
  },
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