import { Router } from "express"
import middlewares from "../middlewares"
const router = Router()

// Services
import { addVideoToQueue } from "../../services/video.service"

export default (app) => {
    // Prefix routes
    app.use("/videos", router)

    /**
     * router.route('/').get() Adds video to job queue
     */
    router.route("/").get(middlewares.isVideoFile, async (req, res) => {
        // Get video file name
        const fileName = req.query.fileName

        // Add file to queue
        let job = await addVideoToQueue(fileName)

        return res.json({
            message: "Video has been added to the queue",
            job,
        })
    })
}
