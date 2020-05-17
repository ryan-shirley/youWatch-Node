// Setup Express
import express from "express"
const app = express()
const port = 3000

// Database Connection
let mongoose = require("mongoose"),
    mongoDBURL = process.env.MONGODB_URI_LIVE || process.env.MONGODB_URI_DEV

mongoose
    .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`Successfully connected to MongoDB!`)
    })
    .catch((error) => {
        console.log("Connection failed!")
        console.log(error)
    })

// Bull UI
import { UI } from "bull-board"
app.use("/admin/queues", UI)

// Grouped Routes
import videosRouter from "./routes/videos"

// Routing
app.use("/videos", videosRouter)

// Server Listen
app.listen(port, () =>
    console.log(
        `youWatch server using Node.js is listening at http://localhost:${port}`
    )
)
