import config from "./config"
import express from "express"
import Logger from "./loaders/logger"

async function startServer() {
    const app = express()

    /**
     * A little hack here
     * Import/Export can only be used in 'top-level code'
     * Well, at least in node 10 without babel and at the time of writing
     * So we are using good old require.
     **/
    await require("./loaders").default({ expressApp: app })

    // Start watching for new video clips
    // require("./jobs/watcher.jobs").default()

    // Save images from camera - Custom model learning
    require("./jobs/car-image-learning.jobs").default()

    app.listen(config.port, (err) => {
        if (err) {
            Logger.error(err)
            process.exit(1)
            return
        }

        Logger.info(`################################################
         🛡️  Server listening on port: ${config.port} 🛡️ 
         ################################################`)
    })
}

startServer()
