const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendTicketEmail } = require('../utils/sendEmail');

// Helper to escape regex special characters to prevent crashes
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// 1. Create Event (Organizer / Admin)
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const event = await Event.create({
      ...req.body,
      organizer: userId
    });
    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. List all published events with Search & Category Filter
exports.getEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'published' };

    // Search query with regex safety
    if (search && search.trim() !== '') {
      const sanitized = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { venue: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. Register for an event (Atomic Seat Increment + Automated Email)
exports.registerForEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }

    // Check if already registered
    const existing = await Registration.findOne({ event: eventId, user: userId });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Atomic update to avoid race-condition and over-booking
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'published',
        $expr: { $lt: ['$attendeeCount', '$capacity'] }
      },
      { $inc: { attendeeCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      if (event.status !== 'published') return res.status(400).json({ message: 'Event is closed for registration' });
      return res.status(400).json({ message: 'Event capacity reached! All seats are full.' });
    }

    // Create registration record
    const registration = await Registration.create({
      event: eventId,
      user: userId,
      checkedIn: false
    });

    // Send ticket confirmation email in background without blocking response
    User.findById(userId)
      .select('email name')
      .then((userData) => {
        if (userData && userData.email) {
          sendTicketEmail(
            userData.email,
            userData.name,
            updatedEvent.title,
            updatedEvent.venue,
            updatedEvent.date
          );
        }
      })
      .catch((err) => console.error('[EMAIL DISPATCH ERROR]:', err.message));

    return res.status(201).json({
      message: 'Registration successful! Confirmation email has been sent.',
      ticketId: registration._id,
      event: updatedEvent
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 4. Get current user's registered tickets
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const registrations = await Registration.find({ user: userId })
      .populate('event')
      .sort({ createdAt: -1 });

    return res.json(registrations);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 5. DELETE /api/events/:id OR /api/events/:id/cancel (CLEANED & SAFE)
exports.cancelRegistration = async (req, res) => {
  try {
    let targetId = req.params.id;
    const userId = req.user?.id || req.user?._id;

    // Clean trailing slashes or subpaths agar url me ':id/cancel' aaye
    if (targetId.includes('/')) {
      targetId = targetId.split('/')[0];
    }

    if (targetId.length > 24) {
      targetId = targetId.slice(-24);
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid ID format provided' });
    }

    // 1. Direct match by Registration ID
    let registration = await Registration.findById(targetId);

    // 2. Fallback: match by Event ID registered by this user
    if (!registration) {
      registration = await Registration.findOne({
        event: targetId,
        user: userId
      });
    }

    if (!registration) {
      return res.status(404).json({ message: 'Registration record not found in database.' });
    }

    const eventId = registration.event;

    // Delete registration document
    await Registration.findByIdAndDelete(registration._id);

    // Safely decrement attendee count using atomic $inc
    if (eventId) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { attendeeCount: -1 }
      });
    }

    return res.status(200).json({ message: 'Registration cancelled successfully. Seat restored!' });
  } catch (error) {
    console.error('Cancel Error:', error);
    return res.status(500).json({ message: 'Server error while cancelling registration', error: error.message });
  }
};

// 6. Organizer Dashboard: Fetch all events created by current organizer
exports.getOrganizerEvents = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const events = await Event.find({ organizer: userId }).sort({ createdAt: -1 });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch organizer events', error: error.message });
  }
};

// 7. Organizer: View registered attendee list for a specific event
exports.getEventAttendees = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const attendees = await Registration.find({ event: eventId })
      .populate('user', 'name email createdAt')
      .sort({ createdAt: -1 });

    return res.json(attendees);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch attendee list', error: error.message });
  }
};

// 8. Organizer: Close or Re-open registrations manually
exports.toggleEventStatus = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const event = await Event.findOne({ _id: eventId, organizer: userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    event.status = event.status === 'published' ? 'closed' : 'published';
    await event.save();

    return res.json({ message: `Event marked as ${event.status}`, event });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle event status', error: error.message });
  }
};

// 9. Organizer Desk Verification (Live QR Check-in)
exports.verifyTicketPass = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: 'Invalid ticket pass ID format' });
    }

    const registration = await Registration.findById(ticketId)
      .populate('user', 'name email')
      .populate('event', 'title venue date organizer');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid or non-existent ticket pass' });
    }

    // Check authorization: Must be the organizer of this event or an admin
    const organizerId = req.user?.id || req.user?._id;
    const eventOrganizer = registration.event?.organizer?._id || registration.event?.organizer;

    if (
      eventOrganizer &&
      eventOrganizer.toString() !== organizerId?.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized: You are not the organizer for this event' });
    }

    // Prevent duplicate entries
    if (registration.checkedIn) {
      return res.status(400).json({
        message: 'Ticket already scanned & checked-in!',
        checkedInAt: registration.checkedInAt,
        userName: registration.user?.name || 'Attendee'
      });
    }

    // Mark ticket as checked-in
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    return res.status(200).json({
      message: 'Ticket verified successfully! Welcome to the event.',
      userName: registration.user?.name || 'Attendee',
      eventTitle: registration.event?.title || 'Event'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Verification server error', error: error.message });
  }
};