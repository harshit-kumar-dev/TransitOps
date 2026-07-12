const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/authenticate');

router.use('/dashboard', authenticate);

router.get('/dashboard/overview', ctrl.getOverview);

module.exports = router;
