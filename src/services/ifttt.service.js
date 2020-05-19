import request from "request"
import Logger from "../loaders/logger"
import config from "../config"

/**
 * sendNotifications() Sends notification to user
 * using the IFTTT platform
 */
export function sendNotifications(cameraName, imageURL) {
    const urls = config.IFTTT_WEBHOOKS.split(" ")

    // Setup form data for request
    let formData = {
        value1: cameraName,
        value2: imageURL,
    }

    // Call IFTTT webhook
    Logger.debug("Sending Notification using IFTT")
    urls.forEach((url) => {
        request.post({
            url,
            formData,
        })
    })

    return true
}
