const { registrationPattern } = require('./config');

// 📩 Check if the message is a registration message
exports.isRegistrationMessage = (message) => {
    const match = message.match(registrationPattern);
    if (match && !message.includes('ตัวแทน')) {
        return true;
    }
    return false;
};

// 🔍 Get registration data from message
exports.getRegistrationData = (message) => {
    const match = message.match(registrationPattern);
    if (match && !message.includes('ตัวแทน')) {
        return { userId: match[1], phone: match[2], name: match[3] };
    }
    return null;
};