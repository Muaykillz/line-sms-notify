const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require("../serviceAccountKey.json");
const { sendSms } = require('./sms-sender');

// 🔥 Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({
    projectId: "mudev-844b7",
    databaseId: "line-sms-notify"
});

// 📅 Add user SMS schedule data
async function addSmsSchedule(userId, name, phone, scheduleId, schedule) {
    try {
        const userRef = db.collection('users-db').doc(userId);
        const updateData = {};
        updateData.name = name;
        updateData.phone = phone;
        updateData.createdAt = new Date();
        updateData['smsSchedule'] = { [scheduleId]: schedule };
        await userRef.set(updateData, { merge: true });
        console.log(`Successfully added SMS schedule ${scheduleId} for user ${userId}`);
    } catch (error) {
        console.error(`Error adding SMS schedule ${scheduleId} for user ${userId}:`, error);
        throw new Error(`Failed to add SMS schedule: ${error.message}`);
    }
}

// 📤 Add SMS queue
async function addSmsQueue(dateDocId, userId, name, phone, scheduleId, message) {
    try {
        const userRef = db.collection('smsQueue').doc(dateDocId);
        const updateData = {
            [`${userId}`]: {
                'name': name,
                'phone': phone,
                'scheduleId': scheduleId,
                'message': message
            }
        };
        await userRef.set(updateData, { merge: true });
        console.log(`Successfully added SMS schedule ${scheduleId} for user ${userId}`);
    } catch (error) {
        console.error(`Error adding SMS schedule ${scheduleId} for user ${userId}:`, error);
        throw new Error(`Failed to add SMS schedule: ${error.message}`);
    }
}

// 🗓️ Create and send SMS schedules
async function createAndSendSchedule(userId, name, phone, days, message) {
    const date = new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
    const scheduleId = convertDateToDocId(date);
    const schedule = { message, sendDate: date, isSent: false };

    await addSmsSchedule(userId, name, phone, `D${days}`, schedule);
    await addSmsQueue(scheduleId, userId, name, phone, `D${days}`, message);

    if (days === 0) {
        await sendSms(phone, message);
        await updateSmsIsSent(scheduleId, userId, `D${days}`, true);
        await deleteSmsQueue(scheduleId, userId);
    }
}

// 📅 Get unsent schedules of date
async function getUnsentSchedulesOfDate(date) {
    try {
        const today = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
        const docId = convertDateToDocId(today);

        const unsentSchedules = await db.collection('smsQueue').doc(docId).get();
        return { [`${docId}`]: unsentSchedules.data() };
    } catch (error) {
        console.error("Failed to retrieve unsent schedules:", error);
        throw new Error("Error fetching unsent schedules: " + error.message);
    }
}

// ✅ Update SMS isSent status
async function updateSmsIsSent(docId, userId, scheduleId, isSent) {
    try {
        const userRef = db.collection('users-db').doc(userId);
        const updateData = {};
        updateData[`smsSchedule.${scheduleId}.isSent`] = isSent;

        await userRef.update(updateData);
        console.log(`Successfully updated isSent to ${isSent} for schedule ${scheduleId} in document ${docId}`);
    } catch (error) {
        console.error(`Error updating SMS status for user ${userId} in document ${docId}:`, error);
        throw new Error(`Failed to update SMS status: ${error.message}`);
    }
}

// 🗑️ Delete SMS queue
async function deleteSmsQueue(docId, userId) {
    try {
        const userRef = db.collection('smsQueue').doc(docId);
        await userRef.update({ [`${userId}`]: FieldValue.delete() });
        console.log(`Successfully deleted SMS queue document ${docId} for user ${userId}`);

        // Check if the document has any fields left, if not, delete the document
        const docSnapshot = await userRef.get();
        if (docSnapshot.exists && Object.keys(docSnapshot.data()).length === 0) {
            await userRef.delete();
            console.log(`Deleted empty SMS queue document ${docId}`);
        }
    } catch (error) {
        console.error(`Error deleting SMS queue document ${docId}:`, error);
        throw new Error('Error deleting SMS queue: ' + error.message);
    }
}

// 📅 Convert date to document ID
function convertDateToDocId(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

module.exports = { 
    addSmsSchedule, 
    addSmsQueue, 
    getUnsentSchedulesOfDate, 
    updateSmsIsSent, 
    deleteSmsQueue, 
    convertDateToDocId,
    createAndSendSchedule
};
