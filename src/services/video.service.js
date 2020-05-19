import config from "../config"
import Logger from "../loaders/logger"
const ffmpeg = require("ffmpeg")
const path = require("path")
const fs = require("fs")
const request = require("request")
const { createCanvas, loadImage } = require("canvas")

// DAO
import Cameras from "../dao/cameras.dao"

// Jobs / Queues
import videoQueue from "../jobs/video.jobs"

export async function addVideoToQueue(filePath) {
    const filePathDetails = filePath.split("/"),
        fileName = filePathDetails.slice(-1)

    // Get Details from file name
    const fileDetails = fileName[0].split("-"),
        cameraName = fileDetails[0],
        recordingStartTime = fileDetails[1],
        recordingEndTime = fileDetails[2].slice(0, -4)

    // Get actual camera name
    let camera = await Cameras.findOne({ cctv_name: cameraName })

    // Add job to queue
    const job = await videoQueue.add({
        filePath,
        fileName: fileName[0],
        camera,
        recordingStartTime,
        recordingEndTime,
    })

    Logger.debug(`Job #${job.id} added to the video queue`)

    return job
}

/**
 * generateFramesFromVideo() generates frames
 * from video file
 */
export function generateFramesFromVideo(pathToFile) {
    try {
        // Get image file name
        let imageFileNameExt = path.basename(pathToFile),
            imageFileName = imageFileNameExt.slice(0, -4)

        var process = new ffmpeg(pathToFile)
        return process.then(
            async function (video) {
                // Extract frames from video to JPG
                let frames = await video.fnExtractFrameToJPG(
                        "./data/temp_frames",
                        {
                            frame_rate: 1,
                            number: 10,
                            size: "640x?",
                            file_name: imageFileName,
                        }
                    ),
                    meta = video.metadata

                // Remove first element ".DS_Store"
                frames.shift()

                // Sort file names correctly - fix 1,10,2 to 1,2,10 etc..
                let collator = new Intl.Collator(undefined, {
                    numeric: true,
                    sensitivity: "base",
                })

                Logger.debug("Frames generated. Ready for analysis")

                return {
                    frames: frames.sort(collator.compare),
                    fps: meta.video.fps,
                    duration: meta.duration.seconds,
                    resolution: meta.video.resolution,
                }
            },
            function (err) {
                Logger.debug("Error: " + err)
            }
        )
    } catch (e) {
        // console.log(e)
        // console.log(e.code)
        Logger.debug(e.code + " " + e.msg)
    }
}

/**
 * sendForPersonDetection() returns detections found
 * based on the passed-in image
 */
export function sendForPersonDetection(pathToImage, frameNumber = null) {
    Logger.debug(`Sending frame ${frameNumber} for object detection`)

    // Retrieve Image
    let imageStream = fs.createReadStream(pathToImage)

    // Setup form data for request
    let formData = {
        image: imageStream,
        min_confidence: config.DETECTION_MIN_CONFIDENCE,
    }

    // Send request to API Server
    return new Promise(function (resolve, reject) {
        request.post(
            {
                url: `${config.API_DETECTION_URL}/v1/vision/detection`,
                formData,
                time: true,
            },
            function (err, res, body) {
                if (err) throw err

                let response = JSON.parse(body),
                    predictions = response.predictions

                // Add response time to the response
                response.response_time = res.elapsedTime

                if (body.success === false) reject(body)

                // Add if person is found to response
                response.person_found = false
                for (let i = 0; i < predictions.length; i++) {
                    if (predictions[i].label === "person") {
                        response.person_found = true
                        break
                    }
                }

                return resolve(response)
            }
        )
    })
}

/**
 * output_image() saves predictions onto image
 * with bounding box and confidence score
 */
export async function output_image(imagePath, predictions) {
    try {
        // Get image file name
        let imageFileName = path.basename(imagePath)

        // Set image output size
        // TODO: read size from image
        const width = 640
        const height = 478

        // Create Canvas
        const canvas = createCanvas(width, height)
        const context = canvas.getContext("2d")

        // Load Image
        const image = await loadImage(imagePath)
        context.drawImage(image, 0, 0, width, height)

        // Draw Detections
        for (let i = 0; i < predictions.length; i++) {
            // Get details
            let pred = predictions[i],
                label = pred["label"],
                y_min = pred["y_min"],
                x_min = pred["x_min"],
                y_max = pred["y_max"],
                x_max = pred["x_max"],
                confidence = pred["confidence"]

            // Skip if not a person
            if (label !== "person") {
                continue
            }

            // Draw bounding box
            context.beginPath()
            context.lineWidth = "3"
            context.strokeStyle = "blue"
            context.rect(x_min, y_min, x_max - x_min, y_max - y_min)
            context.stroke()

            // Draw Text
            let text = `${label} - ${confidence.toFixed(2) * 100}%`
            context.font = "10px Arial"

            context.fillStyle = "blue"
            context.fillRect(
                x_min,
                y_min - 15,
                context.measureText(text).width + 10,
                15
            ) // BG Text

            context.fillStyle = "white"
            context.fillText(text, x_min + 5, y_min - 5) // Text
        }

        // Save Image
        const filePath = `data/outputs/${imageFileName.slice(0, -4)}.png`,
            buffer = canvas.toBuffer("image/png")
        fs.writeFileSync(filePath, buffer)
        Logger.debug("Saved frame with predictions")

        return filePath
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * clearTempFiles() removes temporary files
 * that were created
 */
export function clearTempFiles() {
    const directory = "./data/temp_frames"

    // Read directory
    fs.readdir(directory, (err, files) => {
        if (err) throw err

        for (const file of files) {
            // Remove Files
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err
            })
        }

        Logger.debug(`Cleared generated frames for analysis`)
    })
}

/**
 * extract_objects() saves seperate images
 * for each of the detections found
 */
export function extract_objects(imagePath, predictions) {
    // Get image file name
    let imageFileName = path.basename(imagePath)

    // Save image for each preduction
    for (var i = 0; i < predictions.length; i++) {
        // Get details
        let pred = predictions[i],
            label = pred["label"],
            y_min = pred["y_min"],
            x_min = pred["x_min"],
            y_max = pred["y_max"],
            x_max = pred["x_max"],
            confidence = pred["confidence"],
            outputImage = `data/outputs/${imageFileName.slice(0, -4)}_${
                i + 1
            }_${label}_${confidence.toFixed(2)}.png`

        // Skip if not a person
        if (label !== "person") {
            continue
        }

        // Format image and save
        sharp(imagePath)
            .extract({
                width: x_max - x_min,
                height: y_max - y_min,
                left: x_min,
                top: y_min,
            })
            .toFile(outputImage)
            .then((new_file_info) => {
                Logger.debug(
                    `Image saved with a detection of a ${label} with ${
                        confidence.toFixed(2) * 100
                    }% confidence.`
                )
            })
            .catch((err) => {
                // console.log(err)
                Logger.debug("An error occured extracting object from frame")
            })
    }
}
