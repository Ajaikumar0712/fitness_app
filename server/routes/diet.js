const router = require('express').Router();
const { logFood, getToday, getHistory, deleteEntry, searchFoods } = require('../controllers/dietController');
const auth = require('../middleware/auth');

router.post('/',           auth, logFood);
router.get('/today',       auth, getToday);
router.get('/history',     auth, getHistory);
router.get('/foods',       auth, searchFoods);
router.delete('/:id',      auth, deleteEntry);

module.exports = router;
