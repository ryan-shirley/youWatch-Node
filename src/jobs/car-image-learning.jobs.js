// Imports
var Queue = require("bull")
const { setQueues } = require("bull-board")
import Logger from "../loaders/logger"
import config from "../config"
import { getCurrentDayTime } from "../services/date.service"
const fs = require("fs")
const request = require("request")

// Setup Queue
var carLearningQueue = new Queue("Car Machine Learning", {
    redis: { port: 6379, host: config.REDIS_HOST || "127.0.0.1" },
})

// Add queue to dashboard
setQueues([carLearningQueue])

// Create download function
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url).pipe(fs.createWriteStream(path)).on("close", callback)
    })
}

export default async () => {
    // Define what the car learning queue job is doing
    carLearningQueue.process(async (job, done) => {
        try {
            Logger.debug("Car Learning Queue: Running Job")
            Logger.debug("Fetching image")

            // File destination
            let dateTime = getCurrentDayTime()
            const destPath = `./data/car-images/car-timelapse-${dateTime}.jpg`

            // Download file
            download(config.CAMERA_LEARNING_URL, destPath, () => {
                Logger.debug(`Image downloaded at ${dateTime}`)
                done()
            })
        } catch (error) {
            // Job had an error
            Logger.debug(error)
            console.log(error)

            done(new Error("Some unexpected error: " + error.message))
        }
    })

    // Define what happens when completed
    carLearningQueue.on("completed", function (job, result) {
        // Job completed!
        Logger.debug("Car Learning Queue: Job Completed")
    })

    // Repeat car learning job every 30 minutes
    Logger.info("Running scheduled car learning job")
    carLearningQueue.add({}, { repeat: { cron: "*/30 * * * *" } })
}
