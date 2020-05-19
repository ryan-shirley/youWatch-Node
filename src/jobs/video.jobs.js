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
import { sendNotifications } from "../services/ifttt.service"
import { uploadImage } from "../services/dropbox.service"
import { uploadVideo } from "../services/slack.service"

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
            {
                camera,
                recordingStartTime,
                recordingEndTime,
                fileName,
                filePath,
            } = data,
            { _id: cameraId, name: cameraName } = camera

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
        let frameCounter = null,
            pathToImageWithDetections = null
        for (let i = 0; i < frames.length; i++) {
            let framePath = frames[i]

            // Send image to API for detections
            let response = await sendForPersonDetection(framePath, i + 1),
                predictions = response.predictions

            // Check if person was found
            if (response.person_found) {
                personFound = true
                frameCounter = i + 1

                // Save image to file
                pathToImageWithDetections = await output_image(
                    framePath,
                    predictions
                )

                break
            }

            // Update job progress - Max 80% at 10 frames
            job.progress(30 + i * 5)
        }

        // Tidy up temp images
        clearTempFiles()

        // Update job progress
        job.progress(80)

        // Run only if person is found in frame
        let notificationStatus = false

        if (personFound) {
            // TODO: Upload image to Dropbox
            let dropboxImageURL = await uploadImage(pathToImageWithDetections)

            // Send notification using IFTTT
            notificationStatus = sendNotifications(cameraName, dropboxImageURL)

            // Upload video to slack
            await uploadVideo(filePath, cameraName)

            // Update job progress
            job.progress(90)
        }

        // Update job progress
        job.progress(95)

        // Add record to database
        // Create result object
        let result = {
            camera_id: cameraId,
            person_found: personFound,
            additional_details: {
                frame_person_found: frameCounter,
                // time_to_detect: ,
                // person_home: ,
                // avg_api_response_time: ,
                // override_time: ,
                notification_sent: notificationStatus,
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
        Logger.debug("Results saved in MongoDB")

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
        console.log(error)

        done(new Error("Some unexpected error: " + error.message))
    }
})

videoQueue.on("completed", function (job, result) {
    // Job completed with output result!
    Logger.debug("Image Queue: Job Completed")
})

export default videoQueue
