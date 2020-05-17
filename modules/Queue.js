// Imports
var Queue = require("bull")
const { setQueues } = require("bull-board")
import sendForPersonDetection from "./API"
import {
    output_image,
    extract_objects
} from "./Image"

// Setup Queue
var imageQueue = new Queue("image detection")

// Add queues to dashboard
setQueues([imageQueue])

// Define what the image queue is doing
imageQueue.process(async (job, done) => {
    try {
        console.log("Image Queue: Running Job")

        // Retreieve data from job
        const data = job.data,
            imagePath = "./data/" + data.pathToFile
            
        // Send image to API for detections
        let response = await sendForPersonDetection(imagePath),
            predictions = response.predictions

        // Save image to file
        await output_image(imagePath, predictions)

        // Set job as completed
        job.progress(100)
        done(null, response)
    } catch (error) {
        // Job had an error
        done(new Error("Some unexpected error: " + error.message))
    }    
})

imageQueue.on("completed", function (job, result) {
    // Job completed with output result!
    // console.log("Image Queue: Job Completed", result)
})

export default imageQueue
