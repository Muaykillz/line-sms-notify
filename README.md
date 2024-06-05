# LINE SMS Notify 📱💬

This project enables the sending of SMS notifications via a LINE bot, providing a seamless integration for automated text messaging. 📩

## Features ✨

- 📨 **Send SMS Notifications**: Utilize a LINE bot to send SMS alerts.
- 👥 **User Management**: Add and manage recipients.
- 🎨 **Message Customization**: Personalize SMS content.

## Installation 🛠️

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Muaykillz/line-sms-notify.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd line-sms-notify
   ```

3. **Install dependencies:**
   ```sh
   npm install
   ```

## Configuration ⚙️

- **Set up environment variables:** Create a `.env` file with the following content:
  ```
  LINE_CHANNEL_ACCESS_TOKEN=your_line_bot_token
  SMS_API_KEY=your_sms_api_key
  ```

- **Create `messages.js` file:** Create a `messages.js` file in the `tools` directory with the following content:
  ```javascript
  module.exports = {
    day0Message: "Hello world",
    // more ...
    };
  ```

## Usage 🚀

1. **Start the application:**
   ```sh
   npm start
   ```

2. **Send a notification:** Use the LINE bot to trigger SMS notifications.

## Contributing 🤝

1. **Fork the repository.**
2. **Create a new branch:**
   ```sh
   git checkout -b feature-name
   ```

3. **Commit your changes:**
   ```sh
   git commit -m "Add new feature"
   ```

4. **Push to the branch:**
   ```sh
   git push origin feature-name
   ```

5. **Open a pull request.**

## License 📄

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact 📞

- 👤 **Author:** Muaykillz
- ✍🏻 **Medium:** [Mudev](https://medium.com/@mzgamer3360)
- 😃 **Facebook** [Thinnaphat Kanchina](https://www.facebook.com/profile.php?id=100004185094386)
