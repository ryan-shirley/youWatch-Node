import { Dropbox } from "dropbox"
import config from "../config"
import Logger from "../loaders/logger"
import fs from "fs"
import path from "path"
import fetch from "isomorphic-fetch"

var dbx = new Dropbox({ accessToken: config.DROPBOX_API_KEY, fetch })

/**
 * uploadImage() Uploads image to Dropbox
 * returns public URL valid for 4 hours
 */
export function uploadImage(imagePath) {
    const fileName = imagePath.split("/").slice(-1)

    // Send request to API Server
    return new Promise(function (resolve, reject) {
        fs.readFile(imagePath, async function (err, contents) {
            if (err) {
                Logger.debug("Error: ", err)
                throw new Error(err)
            }

            try {
                // This uploads basic.js to the root of your dropbox
                let response = await dbx.filesUpload({
                    path: `/Notification Thumbnails/${fileName}`,
                    contents: contents,
                })

                Logger.debug(`Thubnail uploaded to Dropbox`)

                let metadata = await dbx.filesGetTemporaryLink({
                    path: response.path_display,
                })

                return resolve(metadata.link)
            } catch (error) {
                console.log(error)
                throw new Error(error)
            }
        })
    })
}
