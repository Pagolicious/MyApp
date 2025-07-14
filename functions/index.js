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

const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const { sendGroupInvitation } = require("./helpers/inviteHelpers");


exports.autoInviteApplicant = functions.firestore
  .document("groups/{groupId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const groupId = context.params.groupId;

    if (!after || !after.isAutoAccept) return null;

    const oldApplicants = before.applicants || [];
    const newApplicants = after.applicants || [];

    const justAdded = newApplicants.filter(
      a => !oldApplicants.some(b => b.uid === a.uid)
    );

    const groupSnap = await admin.firestore().collection("groups").doc(groupId).get();
    const groupData = { ...groupSnap.data(), id: groupId };

    const inviterSnap = await admin.firestore().collection("users").doc(groupData.createdBy.uid).get();
    if (!inviterSnap.exists) {
      console.log(`Inviter not found for group ${group.id}`);
      console.log('Created By UID:', group.createdBy);
      return; // don't proceed
    }
    const inviter = inviterSnap.data();
    console.log('Inviter:', inviter);

    const promises = justAdded.map(async applicant => {
      const inviteeSnap = await admin.firestore().collection("users").doc(applicant.uid).get();
      const invitee = inviteeSnap.data();

      return sendGroupInvitation(groupData, inviter, invitee, applicant.members || []);
    });


    return Promise.all(promises);
  });
