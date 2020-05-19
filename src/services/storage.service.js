import fs from "fs"
import path from "path"

/**
 * deleteFiles() removes array of files
 */
export function deleteFiles(files) {
    for (const file of files) {
        // Remove Files
        fs.unlink(file, (err) => {
            if (err) throw err
        })
    }

    return true
}

/**
 * deleteFile() remove a single file
 */
export function deleteFile(file) {
    // Remove Files
    fs.unlink(file, (err) => {
        if (err) throw err
    })

    return true
}
