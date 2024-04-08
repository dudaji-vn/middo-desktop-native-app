require('dotenv').config();
module.exports = {
    APP_URL: process.env.APP_URL,
    APPLE_ID: process.env.APPLE_ID,
    APPLE_PASSWORD: process.env.APPLE_ID_PASSWORD,
    APPLE_TEAM_ID: process.env.TEAM_ID,
    SENDER_ID: process.env.SENDER_ID,
    APP_TITLE: 'Middo',
    IS_MAC: process.platform === "darwin",
    DEEP_LINK: 'middo',
    APP_MODEL_ID: 'com.middo.app',
}