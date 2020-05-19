import Logger from "../loaders/logger"
import chokidar from "chokidar"

// Services
import { addVideoToQueue } from "../services/video.service"

export default async () => {
    // Initialize watcher.
    const watcher = chokidar.watch("./data/videos/*.mp4", {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        ignoreInitial: true,
        persistent: true,
    })

    // Add event listeners.
    watcher.on("add", (path, stats) => addVideoToQueue(path))

    Logger.info("Watching folders for new video clips")
}
