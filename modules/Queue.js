// Imports
var Queue = require("bull")
const { setQueues } = require("bull-board")
import sendForPersonDetection from "./API"
import { output_image, extract_objects } from "./Image"
import { generateFramesFromVideo, clearTempFiles } from "./Utility"
import Result from "../models/results.model"

// Setup Queue
var videoQueue = new Queue("video object detection")

// Add queues to dashboard
setQueues([videoQueue])

// Define what the image queue is doing
videoQueue.process(async (job, done) => {
    // Get current day time
    var today = new Date()
    var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate()
    var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    var dateTime = date + " " + time

    try {
        let personFound = false

        console.log("Image Queue: Running Job")

        // Retreieve data from job
        const data = job.data,
            videoPath = "./data/" + data.pathToFile

        // Update job progress
        job.progress(10)

        // Generate frames from video
        let info = await generateFramesFromVideo(videoPath),
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

        // Tidy up temp images
        clearTempFiles()

        // Add record to database
        console.log('Saving result into database');
        
        const record = new Result({
            camera_id: "5ec18859da5f7a784fd44b94",
            // person_home: 0,
            person_found: personFound,
            frame_person_found: frameCounter,
            // time_to_detect: 0,
            // avg_api_response_time: 0,
            override_time: false,
            notification_sent: false,
            fps,
            duration,
            resolution: `${resolution.w}x${resolution.h}`,
            video_finish_time: "2018-8-3 11:12:40",
            job_start_time: dateTime,
        })

        const newRecord = await record.save()

        // Set job as completed and complete
        delete info.frames

        job.progress(100)
        done(null, {
            video_metadata: info,
            person_found: personFound,
        })
    } catch (error) {
        // Job had an error
        done(new Error("Some unexpected error: " + error.message))
    }
})

videoQueue.on("completed", function (job, result) {
    // Job completed with output result!
    // console.log("Image Queue: Job Completed", result)
})

export default videoQueue
