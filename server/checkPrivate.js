import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Import User model first so it gets registered
import './models/User.js';
import Grievance from './models/Grievance.js';

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const privates = await Grievance.find({ visibility: 'private' });

    console.log('Private grievances found:', privates.length);
    privates.forEach(g => {
      console.log('---');
      console.log('Title:', g.title);
      console.log('Visibility:', g.visibility);
      console.log('AssignedAdmins (raw IDs):', g.assignedAdmins);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

check();