// Configure Env
const dotenv = require('dotenv')
dotenv.config()

// Imports
const request = require('request')
const fs = require("fs")

/**
 * sendForPersonDetection() returns detections found
 * based on the passed-in image
 */
export default function sendForPersonDetection(pathToImage) {
    // Retrieve Image
    let imageStream = fs.createReadStream(pathToImage)

    // Setup form data for request
    let formData = {
        "image": imageStream,
        "min_confidence": process.env.DETECTION_MIN_CONFIDENCE
    }

    // Send request to API Server
    return new Promise(function (resolve, reject) {
        request.post({
            url: `${process.env.API_URL}/v1/vision/detection`,
            formData,
            time: true
        }, function (err, res, body) {
            if (err) throw err 
            
            
            let response = JSON.parse(body),
                predictions = response.predictions

            // Add response time to the response
            response.response_time = res.elapsedTime

            if (body.success === false) reject(body)

            // Add if person is found to response
            response.person_found = false
            for (let i = 0; i < predictions.length; i++) {
                if (predictions[i].label === 'person') {
                    response.person_found = true
                    break
                }
            }

            return resolve(response)
        })
    });
}