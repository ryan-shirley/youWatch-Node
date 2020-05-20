import Logger from "../loaders/logger"
import chokidar from "chokidar"
import moveFile from "move-file"

// Services
import { addVideoToQueue } from "../services/video.service"
import { checkIfHome } from "../services/user.service"

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
        // const homeIsOccupied = await checkIfHome()

        const filePathDetails = path.split("/"),
            fileName = filePathDetails.slice(-1),
            recordingDate = filePathDetails[3],
            recordingYear = recordingDate.substring(4, 8),
            recordingMonth = recordingDate.substring(0, 2),
            recordingDay = recordingDate.substring(2, 4)

        // Get Details from file name
        const fileDetails = fileName[0].split("-"),
            reolinkCameraName = fileDetails[0],
            recordingStartTime = fileDetails[1],
            recordingEndTime = fileDetails[2].slice(0, -4),
            recordingStartTimestamp = `${recordingYear}-${recordingMonth}-${recordingDay} ${recordingStartTime.substring(
                0,
                2
            )}:${recordingStartTime.substring(
                2,
                4
            )}:${recordingStartTime.substring(4, 6)}`,
            recordingEndTimestamp = `${recordingYear}-${recordingMonth}-${recordingDay} ${recordingEndTime.substring(
                0,
                2
            )}:${recordingEndTime.substring(2, 4)}:${recordingEndTime.substring(
                4,
                6
            )}`

        // Move file to analysis folder
        const newDestination = `data/videos/analysis/${fileName}`
        await moveFile(path, newDestination)

        return addVideoToQueue(
            newDestination,
            fileName,
            reolinkCameraName,
            recordingStartTimestamp,
            recordingEndTimestamp
        )
    })
    Logger.info("Watching folders for new video clips")
}
