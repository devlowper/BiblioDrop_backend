const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUserRole, deleteUser } = require('../controllers/user.controller');
const { verifyJWT, verifyRole } = require('../middleware/auth');

router.post('/', createUser); // Public, for registration
router.get('/', verifyJWT, verifyRole('admin'), getUsers);
router.patch('/role/:id', verifyJWT, verifyRole('admin'), updateUserRole);
router.delete('/:id', verifyJWT, verifyRole('admin'), deleteUser);

module.exports = router;
