import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['Academic', 'Infrastructure', 'Administration', 'Personal'],
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        url: String,
        publicId: String,
        originalName: String,
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    assignedAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

// Index for fast queries
grievanceSchema.index({ status: 1, category: 1, createdAt: -1 });
grievanceSchema.index({ submittedBy: 1, createdAt: -1 });

const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;