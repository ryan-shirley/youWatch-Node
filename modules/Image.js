// Imports
const fs = require("fs")
const sharp = require("sharp")
const { createCanvas, loadImage } = require("canvas")
const path = require("path")

/**
 * output_image() saves predictions onto image
 * with bounding box and confidence score
 */
export async function output_image(imagePath, predictions) {
    try {
        // Get image file name
        let imageFileName = path.basename(imagePath)

        // Set image output size
        // TODO: read size from image
        const width = 640
        const height = 478

        // Create Canvas
        const canvas = createCanvas(width, height)
        const context = canvas.getContext("2d")

        // Load Image
        const image = await loadImage(imagePath)
        context.drawImage(image, 0, 0, width, height)

        // Draw Detections
        for (let i = 0; i < predictions.length; i++) {
            // Get details
            let pred = predictions[i],
                label = pred["label"],
                y_min = pred["y_min"],
                x_min = pred["x_min"],
                y_max = pred["y_max"],
                x_max = pred["x_max"],
                confidence = pred["confidence"]

            // Skip if not a person
            if (label !== "person") {
                continue
            }

            // Draw bounding box
            context.beginPath()
            context.lineWidth = "3"
            context.strokeStyle = "blue"
            context.rect(x_min, y_min, x_max - x_min, y_max - y_min)
            context.stroke()

            // Draw Text
            let text = `${label} - ${confidence.toFixed(2) * 100}%`
            context.font = "10px Arial"

            context.fillStyle = "blue"
            context.fillRect(
                x_min,
                y_min - 15,
                context.measureText(text).width + 10,
                15
            ) // BG Text

            context.fillStyle = "white"
            context.fillText(text, x_min + 5, y_min - 5) // Text
        }

        // Save Image
        console.log("Saving predictions on top of image.")
        const buffer = canvas.toBuffer("image/png")
        fs.writeFileSync(
            `data/outputs/${imageFileName.slice(0, -4)}.png`,
            buffer
        )
    } catch (error) {
        throw new Error (error)
    }
}

/**
 * extract_objects() saves seperate images
 * for each of the detections found
 */
export function extract_objects(imagePath, predictions) {
    // Get image file name
    let imageFileName = path.basename(imagePath)

    // Save image for each preduction
    for (var i = 0; i < predictions.length; i++) {
        // Get details
        let pred = predictions[i],
            label = pred["label"],
            y_min = pred["y_min"],
            x_min = pred["x_min"],
            y_max = pred["y_max"],
            x_max = pred["x_max"],
            confidence = pred["confidence"],
            outputImage = `data/outputs/${imageFileName.slice(0, -4)}_${
                i + 1
            }_${label}_${confidence.toFixed(2)}.png`

        // Skip if not a person
        if (label !== "person") {
            continue
        }

        // Format image and save
        sharp(imagePath)
            .extract({
                width: x_max - x_min,
                height: y_max - y_min,
                left: x_min,
                top: y_min,
            })
            .toFile(outputImage)
            .then((new_file_info) => {
                console.log(
                    `Image saved with a detection of a ${label} with ${
                        confidence.toFixed(2) * 100
                    }% confidence.`
                )
            })
            .catch((err) => {
                console.log(err)
                console.log("An error occured")
            })
    }
}
