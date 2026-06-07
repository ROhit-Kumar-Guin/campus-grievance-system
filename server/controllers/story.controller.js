import Story from '../models/Story.js';
import { getCloudinary } from '../config/cloudinary.js';

// ── GET ALL STORIES ──────────────────────────────────────────
export const getStories = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .populate('author', 'name role department')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Story.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      stories,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE STORY (Admin only) ────────────────────────────────
export const createStory = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const storyData = {
      title,
      content,
      category: category || 'Announcement',
      author: req.user._id,
    };

    // If an image was uploaded, add it
    if (req.file) {
      storyData.imageUrl = req.file.path;
      storyData.publicId = req.file.filename;
    }

    const story = await Story.create(storyData);
    await story.populate('author', 'name role department');

    res.status(201).json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── TOGGLE LIKE ──────────────────────────────────────────────
export const toggleLike = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = story.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      story.likes = story.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      story.likes.push(req.user._id);
    }

    await story.save();

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likesCount: story.likes.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADD COMMENT ──────────────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    story.comments.push({ user: req.user._id, text });
    await story.save();
    await story.populate('comments.user', 'name');

    const newComment = story.comments[story.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE STORY (Admin only) ────────────────────────────────
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Delete image from Cloudinary if exists
    if (story.publicId) {
      const cloudinary = getCloudinary();
      await cloudinary.uploader.destroy(story.publicId);
    }

    await story.deleteOne();
    res.status(200).json({ success: true, message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};