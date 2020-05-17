// Setup Express
const express = require("express")
const app = express()
const port = 3000

// Bull UI
const { UI } = require("bull-board")
app.use("/admin/queues", UI)

// Grouped Routes
import videosRouter from "./routes/videos"

// Routing
app.use('/videos', videosRouter)

// Server Listen
app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
)
