const { sendFCMNotification } = require('../helpers/sendFCMNotification');
// const firestore = require('firebase-admin').firestore(); // ← add if needed
const admin = require('firebase-admin'); // ✅ required

const sendGroupInvitation = async (
  group,
  inviter,
  invitee,
  members = []
) => {
  //   const admin = require('firebase-admin'); // make sure admin is required
  // const firestore = admin.firestore();     // ✅ moved inside function
  const firestore = admin.firestore(); // ✅ also safe

  const invitationRef = firestore.collection('groupInvitations').doc();

  const invitation = {
    id: invitationRef.id,
    groupId: group.id,
    sender: inviter.uid,
    receiver: invitee.uid,
    activity: group.activity,
    fromDate: group.fromDate,
    fromTime: group.fromTime,
    toTime: group.toTime,
    location: group.location,
    members,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await invitationRef.set(invitation);

  if (invitee.fcmToken) {
    const title = `You've been invited to ${group.title}`;
    const body = `${inviter.firstName} invited you to join as ${role}.`;

    await sendFCMNotification(invitee.fcmToken, title, body);
  }
};

module.exports = { sendGroupInvitation };
