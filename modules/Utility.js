// Configure Env
const dotenv = require("dotenv")
dotenv.config()

// Imports
const ping = require("ping")
const ffmpeg = require("ffmpeg")
const path = require("path")
const fs = require("fs")

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
 * generateFramesFromVideo() generates frames
 * from video file
 */
export function generateFramesFromVideo(pathToFile) {
    try {
        // Get image file name
        let imageFileNameExt = path.basename(pathToFile),
            imageFileName = imageFileNameExt.slice(0, -4)

        var process = new ffmpeg(pathToFile)
        return process.then(
            async function (video) {
                // Extract frames from video to JPG
                let frames = await video.fnExtractFrameToJPG(
                        "./data/temp_frames",
                        {
                            frame_rate: 1,
                            number: 10,
                            size: "640x?",
                            file_name: imageFileName,
                        }
                    ),
                    meta = video.metadata

                // Remove first element ".DS_Store"
                frames.shift()

                // Sort file names correctly - fix 1,10,2 to 1,2,10 etc..
                let collator = new Intl.Collator(undefined, {
                    numeric: true,
                    sensitivity: "base",
                })

                return {
                    frames: frames.sort(collator.compare),
                    fps: meta.video.fps,
                    duration: meta.duration.seconds,
                    resolution: meta.video.resolution,
                }
            },
            function (err) {
                console.log("Error: " + err)
            }
        )
    } catch (e) {
        console.log(e.code)
        console.log(e.msg)
    }
}

/**
 * clearTempFiles() removes temporary files
 * that were created
 */
export function clearTempFiles() {
    const directory = "./data/temp_frames"

    // Read directory
    fs.readdir(directory, (err, files) => {
        if (err) throw err

        for (const file of files) {
            // Remove Files
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err
            })
        }
    })
}
