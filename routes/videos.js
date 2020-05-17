// Imports
import express from "express"
var router = express.Router()

// Queue
import videoQueue from "../modules/Queue"
import { generateFramesFromVideo } from "../modules/Utility"

/**
 * route('/').get() add test job to queue
 */
router.route("/").get((req, res) => {
    // Add job to queue
    const job = videoQueue.add({ pathToFile: "videos/no-person.mp4" })

    return res.send(job)
})

/**
 * route('/meta').get() return meta from video file
 */
router.route("/meta").get(async (req, res) => {
    let info = await generateFramesFromVideo("videos/test.mp4")

    return res.send(info)
})

export default router
