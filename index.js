// Configure Env
const dotenv = require('dotenv');
dotenv.config();

// Imports
const request = require("request")
const fs = require("fs")
const sharp = require('sharp')
const {
    createCanvas,
    loadImage
} = require('canvas')

// Start Timer
var start = new Date()

// Retrieve Image
image_stream = fs.createReadStream("data/images/test2.png")


var form = {
    "image": image_stream,
    "min_confidence": 0.50
}

request.post({
    url: `${process.env.API_URL}:${process.env.API_PORT}/v1/vision/detection`,
    formData: form
}, function (err, res, body) {
    let analysis = new Date() - start
    console.info('Execution time analysis: %dms', analysis)

    response = JSON.parse(body)
    predictions = response["predictions"]

    // Save Image
    output_image(predictions)

    extract_objects(predictions)
})


async function output_image(predictions) {
    const width = 640
    const height = 478

    // Create Canvas
    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    // Load Image
    const image = await loadImage('data/images/test2.png')
    context.drawImage(image, 0, 0, width, height)

    // Draw Detections
    for (var i = 0; i < predictions.length; i++) {

        // Get details
        pred = predictions[i]
        label = pred["label"]
        y_min = pred["y_min"]
        x_min = pred["x_min"]
        y_max = pred["y_max"]
        x_max = pred["x_max"]
        confidence = pred["confidence"]

        // Skip if not a person
        if (label !== 'person') {
            continue
        }

        // Draw bounding box
        context.beginPath();
        context.lineWidth = "3";
        context.strokeStyle = "blue";
        context.rect(x_min, y_min, x_max - x_min, y_max - y_min);
        context.stroke();

        // Draw Text
        let text = `${label} - ${confidence.toFixed(2)*100}%`
        context.font = "10px Arial";

        context.fillStyle = "blue";
        context.fillRect(x_min, y_min - 15, context.measureText(text).width + 10, 15); // BG Text

        context.fillStyle = "white";
        context.fillText(text, x_min + 5, y_min - 5); // Text
    }

    // Save Image
    console.log('Saving Image');
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('data/outputs/test2.png', buffer)
}

function extract_objects(predictions) {
    for (var i = 0; i < predictions.length; i++) {

        pred = predictions[i]
        label = pred["label"]
        y_min = pred["y_min"]
        x_min = pred["x_min"]
        y_max = pred["y_max"]
        x_max = pred["x_max"]
        confidence = pred["confidence"]

        // Skip if not a person
        if (label !== 'person') {
            continue
        }

        // original image
        let originalImage = 'data/images/test2.png';

        // file name for cropped image
        let outputImage = `data/outputs/test_${i}_${label}_${confidence.toFixed(2)}.png`;

        sharp(originalImage).extract({
                width: x_max - x_min,
                height: y_max - y_min,
                left: x_min,
                top: y_min
            }).toFile(outputImage)
            .then(function (new_file_info) {
                console.log("Image cropped and saved");
            })
            .catch(function (err) {
                console.log(err);
                console.log("An error occured");
            });
    }
}