// Imports
import express from "express"
var router = express.Router()

// Queue
import imageQueue from "../modules/Queue"
import { getMetaFromVideo } from "../modules/Utility"

/**
 * route('/').get() add test job to queue
 */
router.route("/").get((req, res) => {
    // Add job to queue
    imageQueue.add({ pathToFile: "images/test.jpg" })

    return res.send("Hello World!")
})

/**
 * route('/meta').get() return meta from video file
 */
router.route("/meta").get(async (req, res) => {
    let metadata = await getMetaFromVideo("videos/test.mp4")

    return res.send({
        fps: metadata.video.fps,
        duration: metadata.duration.seconds,
        resolution: metadata.video.resolution,
    })
})

export default router
