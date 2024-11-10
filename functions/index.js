/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require('firebase-functions/v2/https');
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendGroupInvitation = functions.https.onCall((data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { fcmToken, title, body } = data;

  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
  };

  return admin
    .messaging()
    .send(message)
    .then(response => {
      return { success: true, messageId: response };
    })
    .catch(error => {
      console.error("Error sending FCM message:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to send FCM message",
        error,
      );
    });
});
