import Message from '../models/Message.js';
import Grievance from '../models/Grievance.js';
import notifyUser from '../utils/notifyUser.js';

// GET /api/messages/:grievanceId — get all messages for a grievance
export const getMessages = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.grievanceId);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    // Only allow the submitter or assigned admins to see messages
    const isOwner    = grievance.submittedBy.toString() === req.user._id.toString();
    const isAssigned = grievance.assignedAdmins?.some(
      (a) => a.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ grievance: req.params.grievanceId })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: 1 });

    // Mark messages as read for this user
    await Message.updateMany(
      { grievance: req.params.grievanceId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/messages/:grievanceId — send a message
export const sendMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const grievance = await Grievance.findById(req.params.grievanceId)
      .populate('submittedBy', 'name')
      .populate('assignedAdmins', 'name');

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const message = await Message.create({
      grievance: grievance._id,
      sender:    req.user._id,
      receiver:  receiverId,
      text,
    });

    await message.populate('sender', 'name role');
    await message.populate('receiver', 'name role');

    // Notify the receiver via socket
    await notifyUser({
      io:          req.io,
      recipientId: receiverId,
      senderId:    req.user._id,
      type:        'comment_added',
      title:       `💬 New private message from ${req.user.name}`,
      message:     `Regarding: "${grievance.title}" — "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
      grievanceId: grievance._id,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/inbox — all private grievances sent to this admin
export const getInbox = async (req, res) => {
  try {
    console.log('Admin ID looking for inbox:', req.user._id);
    console.log('Admin ID as string:', req.user._id.toString());

    const grievances = await Grievance.find({
      visibility: 'private',
    })
      .populate('submittedBy', 'name email department')
      .populate('assignedAdmins', 'name email');

    console.log('ALL private grievances:', grievances.length);
    grievances.forEach(g => {
      console.log('Title:', g.title);
      console.log('AssignedAdmins:', g.assignedAdmins.map(a => a._id?.toString()));
      console.log('Match:', g.assignedAdmins.some(a => a._id?.toString() === req.user._id.toString()));
    });

    // Filter manually
    const myGrievances = grievances.filter(g =>
      g.assignedAdmins.some(a => a._id?.toString() === req.user._id.toString())
    );

    console.log('My private grievances:', myGrievances.length);

    const grievancesWithCount = await Promise.all(
      myGrievances.map(async (g) => {
        const unread = await Message.countDocuments({
          grievance: g._id,
          receiver:  req.user._id,
          isRead:    false,
        });
        return { ...g.toObject(), unreadMessages: unread };
      })
    );

    res.status(200).json({ success: true, grievances: grievancesWithCount });
  } catch (error) {
    console.log('INBOX ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};