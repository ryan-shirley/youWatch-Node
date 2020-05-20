import Logger from "../loaders/logger"
import chokidar from "chokidar"
import moveFile from "move-file"

// Services
import { addVideoToQueue } from "../services/video.service"

export default async () => {
    // Initialize watcher.
    const watcher = chokidar.watch(
        "./data/videos/Reolink Client-Record/*/*.mp4",
        {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            ignoreInitial: true,
            persistent: true,
            awaitWriteFinish: true,
        }
    )

    // Add event listeners.
    watcher.on("add", async (path, stats) => {
        const filePathDetails = path.split("/"),
            fileName = filePathDetails.slice(-1)

        // Move file to analysis folder
        let newDestination = `data/videos/analysis/${fileName}`
        await moveFile(path, newDestination)

        return addVideoToQueue(newDestination)
    })
    Logger.info("Watching folders for new video clips")
}
