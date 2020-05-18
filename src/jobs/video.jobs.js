// Imports
var Queue = require("bull")
const { setQueues } = require("bull-board")

// Models
// import Result from "../models/results.model"

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
        const { data } = job,
            { camera, recordingStartTime, recordingEndTime, fileName } = data,
            videoPath = "./data/videos/" + fileName

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

        // Update job progress
        job.progress(80)

        // Tidy up temp images
        clearTempFiles()

        // Update job progress
        job.progress(90)

        // Add record to database
        console.log("Saving result into database")

        // TODO: Better Format data and move to controller
        // const record = new Result({
        //     camera_id: "5ec18859da5f7a784fd44b94",
        //     // person_home: 0,
        //     person_found: personFound,
        //     frame_person_found: frameCounter,
        //     // time_to_detect: 0,
        //     // avg_api_response_time: 0,
        //     override_time: false,
        //     notification_sent: false,
        //     fps,
        //     duration,
        //     resolution: `${resolution.w}x${resolution.h}`,
        //     video_finish_time: "2018-8-3 11:12:40",
        //     job_start_time: dateTime,
        // })

        // const newRecord = await record.save()

        // Set job as completed and complete
        delete info.frames

        job.progress(100)
        done(null, {
            video_metadata: info,
            person_found: personFound,
        })
    } catch (error) {
        // Job had an error
        console.log(error)

        done(new Error("Some unexpected error: " + error.message))
    }
})

// videoQueue.on("completed", function (job, result) {
//     // Job completed with output result!
//     // console.log("Image Queue: Job Completed", result)
// })

export default videoQueue