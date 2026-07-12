const router = require('express').Router();
const ctrl = require('../controllers/safety.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Enforce Safety Officer authorization
router.use('/safety', authenticate, authorize('SAFETY_OFFICER'));

router.get('/safety/drivers', ctrl.getDrivers);
router.put('/safety/drivers/:id/status', ctrl.toggleDriverSuspension);
router.get('/safety/trips/eligibility', ctrl.getTripsEligibility);

module.exports = router;
