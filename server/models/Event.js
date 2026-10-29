const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  attendeeCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['published', 'closed'], 
    default: 'published' 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);