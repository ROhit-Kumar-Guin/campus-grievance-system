import Resource from '../models/Resource.js';
import { getCloudinary } from '../config/cloudinary.js';

// ── GET ALL RESOURCES ────────────────────────────────────────
// GET /api/resources
// Anyone logged in can view resources
export const getResources = async (req, res) => {
  try {
    const { department, subject, type } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (subject)    filter.subject    = { $regex: subject, $options: 'i' };
    if (type)       filter.type       = type;

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPLOAD RESOURCE (Admin only) ─────────────────────────────
// POST /api/resources
export const uploadResource = async (req, res) => {
  try {
    const { title, description, department, subject, type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    if (!title || !department || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title, department and subject are required',
      });
    }

    // Log what multer/cloudinary gives us so we can debug
    console.log('Uploaded file info:', req.file);

    const resource = await Resource.create({
      title,
      description: description || '',
      department,
      subject,
      type: type || 'Notes',
      fileUrl:      req.file.path,
      publicId:     req.file.filename,
      originalName: req.file.originalname || title,
      fileFormat:   req.file.mimetype || '',
      uploadedBy:   req.user._id,
    });

    await resource.populate('uploadedBy', 'name role');

    res.status(201).json({ success: true, resource });
  } catch (error) {
    console.log('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── INCREMENT DOWNLOAD COUNT ─────────────────────────────────
// PATCH /api/resources/:id/download
export const trackDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE RESOURCE (Admin only) ─────────────────────────────
// DELETE /api/resources/:id
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Delete from Cloudinary first
    const cloudinary = getCloudinary();
await cloudinary.uploader.destroy(resource.publicId, {
  resource_type: 'raw',
});

    await resource.deleteOne();

    res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};