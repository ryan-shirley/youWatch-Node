// Imports
var Queue = require("bull")
const { setQueues } = require("bull-board")
import { getCurrentDayTime } from "../services/date.service"
import Logger from "../loaders/logger"

// DAO
import Results from "../dao/results.dao"

// Services
import {
    generateFramesFromVideo,
    sendForPersonDetection,
    output_image,
    clearTempFiles,
} from "../services/video.service"

// Setup Queue
var videoQueue = new Queue("video object detection")

// Add queues to dashboard
setQueues([videoQueue])

// Define what the image queue is doing
videoQueue.process(async (job, done) => {
    // Get current day time
    let dateTime = getCurrentDayTime()

    try {
        let personFound = false

        Logger.debug("Image Queue: Running Job")

        // Retreieve data from job
        const { data } = job,
            { camera, recordingStartTime, recordingEndTime, fileName, filePath } = data,
            { _id: cameraId, cameraName: name } = camera

        // Update job progress
        job.progress(10)

        // Generate frames from video
        let info = await generateFramesFromVideo(filePath),
            frames = info.frames,
            fps = info.fps,
            duration = info.duration,
            resolution = info.resolution

        // Update job progress
        job.progress(20)

        // Loop frames to detect person
        let frameCounter = null
        for (let i = 0; i < frames.length; i++) {
            let framePath = frames[i]

            // Send image to API for detections
            let response = await sendForPersonDetection(framePath),
                predictions = response.predictions

            // Check if person was found
            if (response.person_found) {
                personFound = true
                frameCounter = i + 1

                // Save image to file
                await output_image(framePath, predictions)

                break
            }

            // Update job progress - Max 80% at 10 frames
            job.progress(30 + i * 5)
        }

        // Update job progress
        job.progress(80)

        // Tidy up temp images
        clearTempFiles()

        // Update job progress
        job.progress(90)

        // Add record to database
        Logger.debug("Saving result into database")

        // TODO: Better Format data and move to controller
        let result = {
            camera_id: cameraId,
            person_found: personFound,
            additional_details: {
                frame_person_found: frameCounter,
                // time_to_detect: ,
                // person_home: ,
                // avg_api_response_time: ,
                // override_time: ,
                notification_sent: false,
                job_start_time: dateTime,
            },
            video_information: {
                fps,
                duration,
                resolution: `${resolution.w}x${resolution.h}`,
                recordingStartTime,
                recordingEndTime,
            },
        }

        let record = Results.save(result)

        // Set job as completed and complete
        delete info.frames

        job.progress(100)
        done(null, {
            video_metadata: info,
            person_found: personFound,
            record,
        })
    } catch (error) {
        // Job had an error
        Logger.debug(error)

        done(new Error("Some unexpected error: " + error.message))
    }
})

videoQueue.on("completed", function (job, result) {
    // Job completed with output result!
    Logger.debug("Image Queue: Job Completed")
})

export default videoQueue
