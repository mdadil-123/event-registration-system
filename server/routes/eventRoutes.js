const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  createEvent, 
  getEvents, 
  registerForEvent, 
  getMyRegistrations,
  cancelRegistration,
  getOrganizerEvents,
  getEventAttendees,
  toggleEventStatus
} = require('../controllers/eventController');

// 1. Static Routes (Hamesha parameterized routes se pehle)
router.get('/', getEvents);
router.post('/', authenticate, authorize(['organizer', 'admin']), createEvent);
router.get('/my/registrations', authenticate, getMyRegistrations);
router.get('/organizer/my-events', authenticate, authorize(['organizer', 'admin']), getOrganizerEvents);

// 2. Cancellation Routes (Dono paths ko directly map karein)
router.delete('/:id', authenticate, cancelRegistration);
router.delete('/:id/cancel', authenticate, cancelRegistration);

// 3. Other Parameterized Routes
router.post('/:id/register', authenticate, registerForEvent);
router.get('/:id/attendees', authenticate, authorize(['organizer', 'admin']), getEventAttendees);
router.patch('/:id/status', authenticate, authorize(['organizer', 'admin']), toggleEventStatus);

module.exports = router;