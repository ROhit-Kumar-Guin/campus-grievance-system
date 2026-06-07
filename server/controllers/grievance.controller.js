import Grievance from '../models/Grievance.js';
import Comment from '../models/Comment.js';
import notifyUser from '../utils/notifyUser.js';

// ── GET ALL GRIEVANCES ───────────────────────────────────────
// Admin sees all, student sees only their own
// GET /api/grievances
export const getGrievances = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;

    // Build filter object dynamically
    const filter = {};

    // Students can only see their own grievances
    if (req.user.role === 'Student') {
      filter.submittedBy = req.user._id;
    }

    // Optional filters from query params
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [grievances, total] = await Promise.all([
      Grievance.find(filter)
        .populate('submittedBy', 'name email department rollNumber')
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
        page: Number(page),
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
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name role' },
      });

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    // Students can only view their own grievances
    if (
      req.user.role === 'Student' &&
      grievance.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
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
    const { title, description, category, priority, isAnonymous } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and category are required',
      });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      isAnonymous: isAnonymous || false,
      submittedBy: req.user._id,
    });

    // Populate before sending back
    await grievance.populate('submittedBy', 'name email department');

    res.status(201).json({ success: true, grievance });
  } catch (error) {
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
      author:    req.user._id,
      text:      `Status changed from "${oldStatus}" to "${status}"`,
      type:      'status_change',
    });
    grievance.comments.push(comment._id);
    await grievance.save();

    // ── Send notification to the student ────────────────────
    // Only notify if the student is not the one making the change
    if (grievance.submittedBy.toString() !== req.user._id.toString()) {
      const notifType = status === 'Resolved' ? 'grievance_resolved' : 'status_change';
      await notifyUser({
        io:          req.io,
        recipientId: grievance.submittedBy,
        senderId:    req.user._id,
        type:        notifType,
        title:       status === 'Resolved'
                       ? '✅ Your issue has been resolved!'
                       : `📋 Issue status updated to "${status}"`,
        message:     `Your grievance "${grievance.title}" status changed from "${oldStatus}" to "${status}"`,
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
    if (deadline)   grievance.deadline   = new Date(deadline);
    if (grievance.status === 'Pending') grievance.status = 'Under Review';

    await grievance.save();

    // Timeline comment
    const commentText = `Assigned to ${assignedTo}${deadline
      ? ` · Deadline: ${new Date(deadline).toDateString()}`
      : ''}`;

    await Comment.create({
      grievance: grievance._id,
      author:    req.user._id,
      text:      commentText,
      type:      'assignment',
    });

    // ── Notify student ───────────────────────────────────────
    await notifyUser({
      io:          req.io,
      recipientId: grievance.submittedBy,
      senderId:    req.user._id,
      type:        'grievance_assigned',
      title:       '📌 Your issue has been assigned',
      message:     `Your grievance "${grievance.title}" was assigned to ${assignedTo}${deadline ? ` with deadline ${new Date(deadline).toDateString()}` : ''}`,
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
      author:    req.user._id,
      text,
      type:      'comment',
    });

    grievance.comments.push(comment._id);
    await grievance.save();
    await comment.populate('author', 'name role');

    // ── Notify the other party ───────────────────────────────
    // If admin comments → notify student
    // If student comments → notify admin (skip for now, complex)
    if (req.user.role === 'Admin') {
      await notifyUser({
        io:          req.io,
        recipientId: grievance.submittedBy,
        senderId:    req.user._id,
        type:        'comment_added',
        title:       '💬 Admin commented on your issue',
        message:     `New comment on "${grievance.title}": "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
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