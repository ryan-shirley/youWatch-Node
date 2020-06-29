// Imports
import {
    extract_objects,
    sendForPersonDetection
} from "../services/video.service"
import {
    getFilesInDir
} from "../services/storage.service"

(async function () {
        // logic here
        console.log('Running..');

        // Get all files in directory
        let files = await getFilesInDir('data/car-images')
        console.log(files)

        // Loop files and generate croped images of car
        files.forEach(async file => {
                // Get Image
                // let originImagePath = 'data/car-images/closed/car-2020-6-27-14-30-0.jpg'
                let originImagePath = `data/car-images/${file}`

                // Run Object Detection
                let response = await sendForPersonDetection(originImagePath)
                // console.log('Results:')
                // console.log(response)

                // Check For Car in predictions

                // Crop to car
                extract_objects(originImagePath, response.predictions, 'car')

                // TODO: Check car is correct car

                // Detect if car is open or closed
        })
})();