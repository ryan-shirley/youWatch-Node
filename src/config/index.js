import dotenv from "dotenv"

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development"

const envFound = dotenv.config()
// if (envFound.error) {
//     // This error should crash whole process

//     throw new Error("⚠️  Couldn't find .env file  ⚠️")
// }

export default {
    /**
     * Your favorite port
     */
    port: parseInt(process.env.PORT, 0),

    /**
     * That long string from mlab
     */
    databaseURL: process.env.MONGODB_URI_LIVE || process.env.MONGODB_URI_DEV,

    /**
     * Detections min confidence
     */
    DETECTION_MIN_CONFIDENCE: process.env.DETECTION_MIN_CONFIDENCE,

    /**
     * FAMILY_PHONE_IP_ADDRESSES
     */
    FAMILY_PHONE_IP_ADDRESSES: process.env.FAMILY_PHONE_IP_ADDRESSES.split(" "),

    /**
     * Times to override house stats - Send notifications even if at home
     */
    HOUSE_OVERRIDE_TIMES: {
        start: process.env.HOUSE_OVERRIDE_TIME_START, // If hour is after will analyse or
        end: process.env.HOUSE_OVERRIDE_TIME_END, // If hour is before will analyse
    },

    /**
     * API Detection URL
     */
    API_DETECTION_URL: process.env.API_URL,

    /**
     * Dropbox API Key
     */
    DROPBOX_API_KEY: process.env.DROPBOX_API_KEY,

    /**
     * IFTTT Webhook URLs
     */
    IFTTT_WEBHOOKS: process.env.IFTTT_WEBHOOKS,

    /**
     * Slack Bot Auth Toekn
     */
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,

    /**
     * REDIS_HOST
     */
    REDIS_HOST: process.env.REDIS_HOST,

    /**
     * Camera learning URL
     */
    CAMERA_LEARNING_URL: process.env.CAMERA_LEARNING_URL,

    /**
     * Your secret sauce
     */
    // jwtSecret: process.env.JWT_SECRET,

    /**
     * Used by winston logger
     */
    logs: {
        level: process.env.LOG_LEVEL || "silly",
    },

    /**
     * API configs
     */
    api: {
        prefix: "/api",
    },
}
