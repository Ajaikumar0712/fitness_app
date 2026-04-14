const router = require('express').Router();
const { logMetric, getMetrics, getLatest, updateMetric, deleteMetric } = require('../controllers/healthController');
const auth = require('../middleware/auth');

router.post('/',        auth, logMetric);
router.get('/',         auth, getMetrics);
router.get('/latest',   auth, getLatest);
router.put('/:id',      auth, updateMetric);
router.delete('/:id',   auth, deleteMetric);

module.exports = router;
