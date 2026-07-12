const router = require('express').Router();
const ctrl = require('../controllers/finance.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use('/finance', authenticate, authorize('FINANCIAL_ANALYST', 'FLEET_MANAGER'));

router.get('/finance/overview', ctrl.getOverview);
router.get('/finance/vehicles', ctrl.getVehicles);
router.get('/finance/expenses', ctrl.getExpenses);
router.get('/finance/trends', ctrl.getTrends);
router.get('/finance/anomalies', ctrl.getAnomalies);

module.exports = router;
