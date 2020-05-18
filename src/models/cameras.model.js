import mongoose from "mongoose"

let CamerasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    cctv_name: {
        type: String,
        required: true,
    },
})

// Export the model
export default mongoose.model("Cameras", CamerasSchema)
