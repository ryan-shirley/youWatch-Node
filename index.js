// Imports
import sendForPersonDetection from "./modules/API"
import {
    output_image,
    extract_objects
} from "./modules/Image"
import { checkIfHome } from "./modules/Utility"

(async function main() {
    try {
        const homeIsOccupied = await checkIfHome()
        console.log('Home is occupied:', homeIsOccupied)

        // Setup image path
        let imagePath = 'data/images/test2.png'

        // Send image to API for detections
        let response = await sendForPersonDetection(imagePath),
            predictions = response.predictions

        // console.log(response);

        // Save image to file
        output_image(imagePath, predictions)

        // Save individual predictions in image
        extract_objects(imagePath, predictions)
    } catch (err) {
        // handle error
        console.log(err);
    }
})()