const functions = require('firebase-functions');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// 📦 Import tools
const {
    getUnsentSchedulesOfDate,
    updateSmsIsSent,
    deleteSmsQueue,
    createAndSendSchedule
} = require('./tools/sms-data-manger');
const { sendSms } = require('./tools/sms-sender');
const { isRegistrationMessage, getRegistrationData } = require('./tools/registration-handler');
const { day0Message, day15Message, day30Message } = require('./messages');

// 🔑 Load environment variables
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN;

// 📲 Main function to handle incoming requests
exports.smsLineNotify = functions.https.onRequest(async (req, res) => {
    const events = req.body.events;
    console.log("Events:", events);
    console.log("---------------")

    for (const event of events) {
        if (event.type === "message") {
            const message = event.message.text;

            // 📨 for test auto send sms in firebase pubsub
            if (message === "t") {
                const today = new Date("2024-06-19");
                const unsentSchedules = await getUnsentSchedulesOfDate(today);
                const docId = Object.keys(unsentSchedules)[0];
                console.log(`docId: ${docId}`);
                const unsentSchedulesData = unsentSchedules[docId];

                for (const [userId, schedule] of Object.entries(unsentSchedulesData)) {

                    // 📤 Send SMS
                    console.log(`Sending SMS to ${schedule.phone} with message: ${schedule.message}`);
                    await sendSms(schedule.phone, schedule.message);

                    // 🗑️ Delete SMS queue & update isSent status
                    await deleteSmsQueue(docId, userId);
                    await updateSmsIsSent(docId, userId, schedule.scheduleId, true);
                }
            }

            // 📝 Handle registration message
            if (isRegistrationMessage(message)) {
                const { userId, phone, name } = getRegistrationData(message);
                console.log(`Registration message detected: UserId: ${userId}, Phone: ${phone}, Name: ${name}`);


                // 📅 Create and send schedule messages
                await createAndSendSchedule(userId, name, phone, 0, day0Message);
                await createAndSendSchedule(userId, name, phone, 15, day15Message);
                await createAndSendSchedule(userId, name, phone, 30, day30Message);
            }
        }
    }

    return res.end();
});

// ⏰ Create firebase schedule every day at 00:00:00
exports.sendSmsLineNotify = functions.pubsub.schedule('every day 00:00:00').onRun(async (context) => {
    try {
        const today = new Date();
        const unsentSchedules = await getUnsentSchedulesOfDate(today);

        if (!unsentSchedules || Object.keys(unsentSchedules).length === 0) {
            console.log('No unsent schedules found for today.');
            return;
        }

        const docId = Object.keys(unsentSchedules)[0];
        console.log(`docId: ${docId}`);
        const unsentSchedulesData = unsentSchedules[docId];

        for (const [userId, schedule] of Object.entries(unsentSchedulesData)) {
            // 📤 Send SMS
            console.log(`Sending SMS to ${schedule.phone} with message: ${schedule.message}`);
            await sendSms(schedule.phone, schedule.message);

            // 🗑️ Delete SMS queue & update isSent status
            await deleteSmsQueue(docId, userId);
            await updateSmsIsSent(docId, userId, schedule.scheduleId, true);
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
});
