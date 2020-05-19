import dotenv from "dotenv"

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development"

const envFound = dotenv.config()
if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️")
}

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
     * Agenda.js stuff
     */
    // agenda: {
    //     dbCollection: process.env.AGENDA_DB_COLLECTION,
    //     pooltime: process.env.AGENDA_POOL_TIME,
    //     concurrency: parseInt(process.env.AGENDA_CONCURRENCY, 10),
    // },

    /**
     * Agendash config
     */
    // agendash: {
    //     user: "agendash",
    //     password: "123456",
    // },
    /**
     * API configs
     */
    api: {
        prefix: "/api",
    },
    /**
     * Mailgun email credentials
     */
    // emails: {
    //     apiKey: process.env.MAILGUN_API_KEY,
    //     domain: process.env.MAILGUN_DOMAIN,
    // },
}
