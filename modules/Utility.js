// Configure Env
const dotenv = require("dotenv")
dotenv.config()

// Imports
const ping = require("ping")
const ffmpeg = require("ffmpeg")

/**
 * checkIfHome() returns status if home is occupied
 * based on the ping status of mobile phones
 */
export async function checkIfHome() {
    let hosts = process.env.FAMILY_PHONE_IP_ADDRESSES.split(" ")

    // Loop through all hosts to check if alive
    for (let host of hosts) {
        let res = await ping.promise.probe(host)

        // If host is alive reutrn
        if (res.alive) {
            return true
        }
    }

    return false
}

/**
 * getMetaFromVideo() returns metadata for file
 * based on the passed in video file
 */
export function getMetaFromVideo(pathToFile) {
    try {
        var process = new ffmpeg("./data/" + pathToFile)
        return process.then(
            (video) => {
                // Video metadata
                // console.log(video.metadata)
                // FFmpeg configuration
                // console.log(video.info_configuration)

                return video.metadata
            },
            (err) => {
                console.log("Error: " + err)
                return err
            }
        )
    } catch (e) {
        console.log(e.code)
        console.log(e.msg)
    }
}
