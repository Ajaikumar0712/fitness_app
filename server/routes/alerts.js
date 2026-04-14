const router = require('express').Router();
const { getAlerts, markRead, markAllRead, deleteAlert } = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.get('/',               auth, getAlerts);
router.patch('/readall',      auth, markAllRead);
router.patch('/:id/read',     auth, markRead);
router.delete('/:id',         auth, deleteAlert);

module.exports = router;
