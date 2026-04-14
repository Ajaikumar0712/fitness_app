const router = require('express').Router();
const { logActivity, getActivities, getWeekly, updateActivity, deleteActivity } = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.post('/',        auth, logActivity);
router.get('/',         auth, getActivities);
router.get('/weekly',   auth, getWeekly);
router.put('/:id',      auth, updateActivity);
router.delete('/:id',   auth, deleteActivity);

module.exports = router;
