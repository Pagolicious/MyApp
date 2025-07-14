const admin = require('firebase-admin');

const sendFCMNotification = async (token, title, body) => {
  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    await admin.messaging().send(message);
    console.log('✅ Notification sent to:', token);
  } catch (error) {
    console.error('❌ FCM Error:', error);
  }
};

module.exports = { sendFCMNotification };
