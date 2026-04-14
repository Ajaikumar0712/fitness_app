const router = require('express').Router();
const { register, login, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        auth, getMe);
router.put('/update',    auth, updateProfile);
router.delete('/delete', auth, deleteAccount);

module.exports = router;
