const express = require('express');
const router = express.Router();

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../../controllers/admin/notificationController');

router.use(isLoggedIn, isAdmin);

// Get the latest notifications and unread count
router.get('/', getNotifications );

// Mark one notification as read
router.patch('/:notificationId/read', markNotificationAsRead );

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead );

module.exports = router;