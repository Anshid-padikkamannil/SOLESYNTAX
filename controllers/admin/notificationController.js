const Notification = require('../../models/notificationSchema');
const mongoose = require('mongoose')

const getNotifications = async (req, res) => {

  try {
    
    const [notification, unreadCount] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .limit(10),
      
      Notification.countDocuments({ isRead: false })
    ]);

    res.json({
      success: true,
      notifications: notification,
      unreadCount
    })

  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch notifications.'
    });
  }
}

const markNotificationAsRead = async (req, res) => {

  try {
    
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { returnDocument: 'after', runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });


  } catch (err) {
    console.error('MARK NOTIFICATION READ ERROR:', err);

     res.status(500).json({
      success: false,
      message: 'Unable to update notification.'
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  
  try {
    
    await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true }}
    );

    res.json({ success: true });

  } catch (err) {
    console.error('MARK ALL NOTIFICATIONS READ ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Unable to update notifications.'
    });
  }
}

// create a notification
const createNotification = async ({type, title, message, link =''}) => {
  // 1. Save the notification to MongoDB
  const notification = await Notification.create({type, title, message, link});

  //2. emit a real-time event to connected admin pages
  try {
    const { getIO } = require('../../services/socketService');
    getIO().to('admins').emit('newNotification', notification);
  } catch (error) {
    console.error('SOCKET NOTIFICATION ERROR:', error.message);
  }

  //3. return the saved notification
  return notification;
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification
}