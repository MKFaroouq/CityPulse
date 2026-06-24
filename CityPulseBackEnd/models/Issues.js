const mongoose = require('mongoose');

// issue schema for city issues reported by citizens
const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    // required: true,
    trim: true,
  },
    location: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In-progress', 'Resolved'],
    default: 'Open',
  },
 image: {
  type: String,
  default: null // هيكون عبارة عن مسار الصورة على السيرفر
}, 
severity: {
    type: String,
    enum: ['Low', 'Medium', 'Critical'],
    default: 'Low',
  },  
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignmentStatus: {
      type: String,
      enum: ['Unassigned', 'Assigned'],
      default: 'Unassigned'
  }  
},{timestamps: true,}
);

module.exports = mongoose.model('Issue', issueSchema);