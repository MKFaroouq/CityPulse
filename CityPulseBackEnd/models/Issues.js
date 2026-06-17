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
severity: {
    type: String,
    enum: ['Low', 'Medium', 'Critical'],
    default: 'Low',
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
},{timestamps: true,}
);

module.exports = mongoose.model('Issue', issueSchema);