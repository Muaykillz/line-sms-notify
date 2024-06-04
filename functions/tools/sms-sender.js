const axios = require('axios');
const env = require('dotenv');
env.config();
const SMS_API_KEY = process.env.SMS_API_KEY;

// 📤 Send SMS
async function sendSms(phoneNumber, message) {
    try {
        const response = await axios.post('https://usms-api.uknowmesms.com/vendor/messages', {
            senderName: "Longdoo",
            message: message,
            phoneNumbers: [phoneNumber]
        }, {
            headers: {
                'Authorization': SMS_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to send SMS:', error);
        throw new Error('Error sending SMS: ' + error.message);
    }
};


module.exports = { sendSms };
