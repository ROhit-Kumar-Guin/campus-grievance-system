import Grievance from '../models/Grievance.js';
import Comment from '../models/Comment.js';
import notifyUser from '../utils/notifyUser.js';

// ── GET ALL GRIEVANCES ───────────────────────────────────────
// Admin sees all, student sees only their own
// GET /api/grievances
export const getGrievances = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20, mine } = req.query;

    let filter = {};

    if (mine === 'true') {
      // My Issues — student's own grievances (both public and private)
      filter.submittedBy = req.user._id;
    } else {
      // All Issues / Dashboard / Admin overview — public only
      // Private grievances handled separately via inbox
      filter.visibility = { $ne: 'private' };
    }

    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const [grievances, total] = await Promise.all([
      Grievance.find(filter)
        .populate('submittedBy', 'name email department rollNumber')
        .populate('assignedAdmins', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Grievance.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      grievances,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE GRIEVANCE ─────────────────────────────────────
// GET /api/grievances/:id
export const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('submittedBy', 'name email department rollNumber')
      .populate('assignedAdmins', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name role' },
      });

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Admins can see everything
    if (req.user.role === 'Admin') {
      return res.status(200).json({ success: true, grievance });
    }

    // Students can only see:
    // 1. Their own grievances
    // 2. Public grievances
    // 3. Private grievances they are an assigned admin of
    const isOwner = grievance.submittedBy?._id.toString() === req.user._id.toString();
    const isPublic = grievance.visibility === 'public' || !grievance.visibility;
    const isAssigned = grievance.assignedAdmins?.some(
      (a) => a._id?.toString() === req.user._id.toString()
    );

    if (!isOwner && !isPublic && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({ success: true, grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE GRIEVANCE ─────────────────────────────────────────
// POST /api/grievances
export const createGrievance = async (req, res) => {
  try {
    const { title, description, category, priority, visibility, assignedAdmins: rawAdmins } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and category are required',
      });
    }

    // Parse assignedAdmins — could be a string (single) or array (multiple)
    let assignedAdmins = [];
    if (visibility === 'private') {
      if (rawAdmins) {
        assignedAdmins = Array.isArray(rawAdmins) ? rawAdmins : [rawAdmins];
      }

      if (assignedAdmins.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select at least one admin for private grievance',
        });
      }
    }

    const grievanceData = {
      title,
      description,
      category,
      priority:       priority || 'Medium',
      visibility:     visibility || 'public',
      assignedAdmins: visibility === 'private' ? assignedAdmins : [],
      submittedBy:    req.user._id,
    };

    if (req.file) {
      grievanceData.attachments = [{
        url:          req.file.path,
        publicId:     req.file.filename,
        originalName: req.file.originalname || title,
      }];
    }

    const grievance = await Grievance.create(grievanceData);
    await grievance.populate('submittedBy', 'name email department');
    await grievance.populate('assignedAdmins', 'name email');

    res.status(201).json({ success: true, grievance });
  } catch (error) {
    console.log('CREATE GRIEVANCE ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE STATUS (Admin only) ───────────────────────────────
// PATCH /api/grievances/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const oldStatus = grievance.status;
    grievance.status = status;
    await grievance.save();

    // Create timeline comment
    const comment = await Comment.create({
      grievance: grievance._id,
      author: req.user._id,
      text: `Status changed from "${oldStatus}" to "${status}"`,
      type: 'status_change',
    });
    grievance.comments.push(comment._id);
    await grievance.save();

    // ── Send notification to the student ────────────────────
    // Only notify if the student is not the one making the change
    if (grievance.submittedBy.toString() !== req.user._id.toString()) {
      const notifType = status === 'Resolved' ? 'grievance_resolved' : 'status_change';
      await notifyUser({
        io: req.io,
        recipientId: grievance.submittedBy,
        senderId: req.user._id,
        type: notifType,
        title: status === 'Resolved'
          ? '✅ Your issue has been resolved!'
          : `📋 Issue status updated to "${status}"`,
        message: `Your grievance "${grievance.title}" status changed from "${oldStatus}" to "${status}"`,
        grievanceId: grievance._id,
      });
    }

    res.status(200).json({ success: true, grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ASSIGN DEPARTMENT + DEADLINE (Admin only) ────────────────
// PATCH /api/grievances/:id/assign
export const assignGrievance = async (req, res) => {
  try {
    const { assignedTo, deadline } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    if (assignedTo) grievance.assignedTo = assignedTo;
    if (deadline) grievance.deadline = new Date(deadline);
    if (grievance.status === 'Pending') grievance.status = 'Under Review';

    await grievance.save();

    // Timeline comment
    const commentText = `Assigned to ${assignedTo}${deadline
      ? ` · Deadline: ${new Date(deadline).toDateString()}`
      : ''}`;

    await Comment.create({
      grievance: grievance._id,
      author: req.user._id,
      text: commentText,
      type: 'assignment',
    });

    // ── Notify student ───────────────────────────────────────
    await notifyUser({
      io: req.io,
      recipientId: grievance.submittedBy,
      senderId: req.user._id,
      type: 'grievance_assigned',
      title: '📌 Your issue has been assigned',
      message: `Your grievance "${grievance.title}" was assigned to ${assignedTo}${deadline ? ` with deadline ${new Date(deadline).toDateString()}` : ''}`,
      grievanceId: grievance._id,
    });

    res.status(200).json({ success: true, grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADD COMMENT ──────────────────────────────────────────────
// POST /api/grievances/:id/comments
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const comment = await Comment.create({
      grievance: grievance._id,
      author: req.user._id,
      text,
      type: 'comment',
    });

    grievance.comments.push(comment._id);
    await grievance.save();
    await comment.populate('author', 'name role');

    // ── Notify the other party ───────────────────────────────
    // If admin comments → notify student
    // If student comments → notify admin (skip for now, complex)
    if (req.user.role === 'Admin') {
      await notifyUser({
        io: req.io,
        recipientId: grievance.submittedBy,
        senderId: req.user._id,
        type: 'comment_added',
        title: '💬 Admin commented on your issue',
        message: `New comment on "${grievance.title}": "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
        grievanceId: grievance._id,
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE GRIEVANCE (Admin only) ────────────────────────────
// DELETE /api/grievances/:id
export const deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    // Delete all comments for this grievance too
    await Comment.deleteMany({ grievance: grievance._id });
    await grievance.deleteOne();

    res.status(200).json({ success: true, message: 'Grievance deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};