// Imports
import express from "express"
var router = express.Router()

// Queue
import imageQueue from "../modules/Queue"

/**
 * route('/').get() add test job to queue
 */
router.route("/").get((req, res) => {
    // Add job to queue
    imageQueue.add({ pathToFile: "images/test.jpg" })

    return res.send("Hello World!")
})

export default router
