import config from "../config"
import Logger from "../loaders/logger"
import fs from "fs"

let token = config.SLACK_BOT_TOKEN,
    Slack = require("slack"),
    bot = new Slack({ token })

/**
 * uploadVideo() Uploads video to slack channel
 */
export async function uploadVideo(videoPath, cameraName) {
    try {
        // Upload Video
        let data = await bot.files.upload({
            token,
            channels: "youwatch",
            title: `⚠ ${cameraName} detected a person`,
            initial_comment: `${cameraName} detected a person`,
            file: fs.createReadStream(videoPath),
        })

        Logger.debug("Video uploaded to Slack channel")

        return "success"
    } catch (error) {
        throw new Error(error)
    }
}
