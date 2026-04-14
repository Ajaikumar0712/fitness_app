const router = require('express').Router();
const { createGoal, getGoals, updateGoal, updateStatus, deleteGoal } = require('../controllers/goalController');
const auth = require('../middleware/auth');

router.post('/',              auth, createGoal);
router.get('/',               auth, getGoals);
router.put('/:id',            auth, updateGoal);
router.patch('/:id/status',   auth, updateStatus);
router.delete('/:id',         auth, deleteGoal);

module.exports = router;
