import Logger from "../loaders/logger"
import chokidar from "chokidar"
import moveFile from "move-file"
import moment from "moment"
import config from "../config"

// Services
import { addVideoToQueue } from "../services/video.service"
import { checkIfHome } from "../services/user.service"
import { deleteFile } from "../services/storage.service"

// DAO
import Results from "../dao/results.dao"
import Cameras from "../dao/cameras.dao"

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
        const currentHour = moment().format("H"),
            isInOverrideTime =
                currentHour > config.HOUSE_OVERRIDE_TIMES.start ||
                currentHour < config.HOUSE_OVERRIDE_TIMES.end

        // House is empty
        const filePathDetails = path.split("/"),
            fileName = filePathDetails.slice(-1),
            recordingDate = filePathDetails[3],
            recordingYear = recordingDate.substring(4, 8),
            recordingMonth = recordingDate.substring(0, 2),
            recordingDay = recordingDate.substring(2, 4)

        // Get Details from file name
        const fileDetails = fileName[0].split("-"),
            reolinkCameraName = fileDetails[0],
            camera = await Cameras.findOne({ cctv_name: reolinkCameraName }),
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

        if (isInOverrideTime || !(await checkIfHome())) {
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
        } else {
            // House is occupied
            // Add record to database
            let result = {
                camera_id: camera._id,
                video_analysed: false,
                video_information: {
                    recordingStartTime: recordingStartTimestamp,
                    recordingEndTime: recordingEndTimestamp,
                },
                additional_details: {
                    person_home: true,
                    notification_sent: false,
                },
            }

            Results.save(result)
            Logger.debug("Results saved in MongoDB")

            // Delete input video
            deleteFile(path)
            Logger.debug("Deleted input video")
        }
    })
    Logger.info("Watching folders for new video clips")
}
